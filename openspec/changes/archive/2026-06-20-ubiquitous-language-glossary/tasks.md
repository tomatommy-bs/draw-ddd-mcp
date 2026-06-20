## 1. データモデル（GUI 側）

- [x] 1.1 `DiagramContext.jsx` に `terms` 配列と `makeTerm` ファクトリ関数を追加する
- [x] 1.2 `addTerm`, `updateTerm`, `deleteTerm` 関数を DiagramContext に追加する（name 重複チェック含む）
- [x] 1.3 参照構文 `[[R:名前]]` `[[E:名前]]` をパースするユーティリティ関数を作成する

## 2. WebSocket プロトコル（GUI 側）

- [x] 2.1 `useRemoteControl.js` に `addTerm`, `updateTerm`, `deleteTerm`, `listTerms` コマンドハンドラを追加する

## 3. Backend MCP ツール

- [x] 3.1 `tm.types.ts` に `TMTerm` と `Rejected` 型を追加する
- [x] 3.2 `add-term.tool.ts` を作成する（entityRef の名前→id 解決含む）
- [x] 3.3 `update-term.tool.ts` を作成する
- [x] 3.4 `delete-term.tool.ts` を作成する
- [x] 3.5 `list-terms.tool.ts` を作成する

## 4. Glossary サイドバー UI

- [x] 4.1 `GlossaryPanel.jsx` コンポーネントを作成する（用語一覧表示、検索入力）
- [x] 4.2 構造化参照のレンダリングコンポーネントを作成する（`[[E:名前]]` → スタイル付きクリッカブル要素、壊れた参照は赤+取り消し線）
- [x] 4.3 用語追加フォーム（インライン）を実装する
- [x] 4.4 用語編集フォーム（カード展開型）を実装する
- [x] 4.5 用語削除（確認ステップ付き）を実装する

## 5. Toolbar とレイアウト統合

- [x] 5.1 Toolbar に Glossary トグルボタン（辞書アイコン）を追加する
- [x] 5.2 `App.jsx` のレイアウトを修正し、GlossaryPanel を SidePanel と同じ右側に配置する

## 6. 双方向ナビゲーション

- [x] 6.1 参照クリック → キャンバス上のエンティティにフォーカス＆選択するハンドラを実装する
- [x] 6.2 エンティティ選択時に Glossary をフィルタするロジックを実装する（entityRef 一致 + definition 中の参照一致、直接対応の ✦ 区別）
- [x] 6.3 検索フィルタとエンティティフィルタの共存ロジックを実装する
