## Context

draw-ddd-mcp は TM モデリングを AI + GUI で行うツール。現在の状態管理は `DiagramContext.jsx` に集約されており、entities / references / notes を管理する。GUI は Canvas + SidePanel の2ペイン構成（SidePanel はエンティティ選択時のみ表示）。Backend は WebSocket で `{ id, command, params }` → `{ id, success, data }` プロトコルを使い、MCP ツールから GUI を操作する。

用語集はこのアーキテクチャに乗せる形で追加する。

## Goals / Non-Goals

**Goals:**
- TM モデルとは独立した用語集データを管理できる
- 用語定義中の `[[R:名前]]` `[[E:名前]]` 参照が TM モデルと構造的にリンクする
- GUI で用語集とキャンバスが双方向にナビゲートできる
- MCP ツールから用語集を CRUD できる

**Non-Goals:**
- 属性レベルの参照（`[[R:顧客.メールアドレス]]`）— エンティティレベルのみ
- 用語集の永続化（ファイル保存）— 既存の export/import の拡張として後で対応
- NotebookLM 等外部ツールとの連携
- 用語の自動提案ロジック（AI エージェントの振る舞いとして定義、ツール側は CRUD のみ提供）

## Decisions

### 1. 用語集の状態管理: DiagramContext に統合

**決定**: 既存の `DiagramContext.jsx` に `terms` 配列を追加する。

**理由**: 用語集は TM モデルのエンティティを参照するため、同一 Context 内にあると参照解決が容易。現時点で状態管理の複雑性は Context 分割を正当化するほどではない。

**代替案**: 別の `GlossaryContext` を新設 → エンティティ参照の解決に Context 間の連携が必要になり、不要な複雑性が生じる。

### 2. 用語データのスキーマ

```typescript
interface TMTerm {
  id: string;
  name: string;             // 用語名 「受注」
  definition: string;       // 構造化参照を含む定義文 「[[R:顧客]] が...」
  context: string;          // 利用文脈 「営業チームの業務フロー」
  rejected: Rejected[];     // 却下した代替候補
  entityRef: string | null; // 対応する TM エンティティの id（任意）
}

interface Rejected {
  term: string;   // 「注文」
  reason: string; // 「顧客視点の言葉のため」
}
```

**決定**: `entityRef` はエンティティの `id` で参照する（name ではない）。定義文中の `[[E:受注]]` は `name` ベースの参照。

**理由**: `entityRef` は 1:1 の構造的紐づけなので id が安全。定義文中の参照は人間が読み書きするので name ベースが自然。name 変更時の追従は表示時に解決する（壊れた参照として警告）。

### 3. 参照構文のパース

**決定**: `[[R:名前]]` と `[[E:名前]]` の2種類。正規表現 `/\[\[(R|E):([^\]]+)\]\]/g` でパースする。

**理由**: Markdown の既存構文と衝突せず、人間にも読みやすい。Wiki リンク `[[...]]` の慣習に沿う。

### 4. GUI レイアウト: 右サイドバーのトグル

**決定**: 既存の SidePanel（エンティティ編集）と同じ右側に Glossary パネルを配置する。Toolbar に辞書アイコンのトグルボタンを追加。SidePanel と Glossary は排他表示（エンティティ選択時は SidePanel 優先、ただし Glossary モード中はフィルタ表示）。

**代替案**: 左サイドバーに独立配置 → Canvas の横幅が両側から圧迫される。

### 5. 双方向ナビゲーションの実装

**Glossary → Canvas**: 定義文中の `[[E:受注]]` をクリック → `setSelectedId` + `focusEntity` でキャンバス上のエンティティにフォーカス＆選択。

**Canvas → Glossary**: エンティティフォーカス時に `terms` をフィルタ。フィルタ条件は:
- `entityRef` が一致する用語（直接対応）
- `definition` 中に `[[R:名前]]` or `[[E:名前]]` でそのエンティティの name を含む用語（言及）

直接対応と言及を視覚的に区別する（直接対応に ✦ マーク）。

### 6. WebSocket コマンド

既存パターンに合わせて以下を追加:

| command | params | 戻り値 |
|---------|--------|--------|
| `addTerm` | `{ name, definition, context?, rejected?, entityRef? }` | `{ term }` |
| `updateTerm` | `{ id, ...fields }` | `{ term }` |
| `deleteTerm` | `{ id }` | `{}` |
| `listTerms` | `{}` | `{ terms }` |

### 7. 壊れた参照の検出

**決定**: GUI のレンダリング時に検出。定義文中の `[[E:名前]]` の名前が現在の entities に存在しなければ壊れた参照。赤色 + 取り消し線で表示。

**理由**: バリデーション時（`tm_validate_model`）ではなく表示時にしたのは、モデリングの途中経過で一時的に壊れた参照が生じるのは自然であり、エラーとして阻止する必要がないため。

## Risks / Trade-offs

- **[Name ベース参照の脆弱性]** → 定義文中の `[[E:受注]]` はエンティティ name が変わると壊れる。表示時に警告するが自動修正はしない。将来的にリネーム時の一括更新を検討。
- **[DiagramContext の肥大化]** → terms 追加で Context がさらに大きくなる。現時点では許容範囲だが、将来的に hooks への分離を検討。
- **[Export/Import 未対応]** → 用語集データは現状セッション内のみ。既存の `tm_export_diagram` / `tm_import_diagram` の拡張は別 change で対応。
