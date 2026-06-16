# Layer 3: 自動化ルール

Layer 2 (constraints) から導出される自動化。TM の構造決定性（公理 A7）に基づき、手動操作を減らす。

## ルール命名規則

`B-{カテゴリ}-{番号}`

- B-RF: 参照関連の自動化
- B-E: エンティティ関連の自動化
- B-M: マイグレーション関連

## 参照関連 (B-RF)

### B-RF-001: Reference 作成時に参照識別子を自動生成

**トリガー**: tm_add_reference が実行される
**動作**:
1. target エンティティの own 識別子（identifierType: 'own'）を取得
2. source エンティティの attributes に以下を追加:
   - name: target の own 識別子と同名
   - dataType: target の own 識別子と同じ
   - isIdentifier: true
   - identifierType: 'reference'
   - referenceId: 作成された Reference の ID
   - identifierOrder: source の既存識別子数 + 1 から採番

**型別の振る舞い**:

| source 型 | 動作 |
|-----------|------|
| E (basic) | target (R or E) の own 識別子を1セット追加 |
| R (subset) | target（親 R）の own 識別子を1セット追加 |
| E (subset) | target（親 E）の own 識別子を1セット追加 |
| C | target (R or C) の own/reference 識別子を1セット追加 |
| Re | target (同一 R) の own 識別子を2セット追加（同名、identifierOrder で区別） |
| M | target (E) の own 識別子を1セット追加 |

**C × R 連鎖の場合**: target が C のとき、C の参照指定子群がすべて source に転写される。

根拠: 公理 A7（構造決定性）、制約 C-A-003

### B-RF-002: Reference 削除時に参照識別子を自動削除

**トリガー**: tm_delete_reference が実行される
**動作**: 削除される Reference の ID を referenceId として持つ属性を、source エンティティからすべて除去する

根拠: 公理 A7（構造決定性の逆）— 参照がなくなれば、参照指定子も消える

### B-RF-003: target の own 識別子が変更されたら参照識別子を同期

**トリガー**: target エンティティの own 識別子の name または dataType が変更される
**動作**: その target を参照しているすべての Reference について、対応する参照識別子の name/dataType を同期更新する

根拠: 参照指定子は target の own のコピーである

**注意**: 現在未実装。実装時は循環更新に注意が必要。

## エンティティ関連 (B-E)

### B-E-001: エンティティ作成時のデフォルト色

**トリガー**: エンティティが作成される
**動作**:
- Resource: color のデフォルト値を #3b82f6（青）
- Event: color のデフォルト値を #eab308（黄）
- Correspondence: デフォルト色は未定義（要設計）
- Mapping: デフォルト色は未定義（要設計）

### B-E-002: エンティティ削除時の Reference 連動削除

**トリガー**: エンティティが削除される
**動作**: 削除されるエンティティを source または target として持つ Reference をすべて削除する。削除された Reference に対して B-RF-002 が発火する。

根拠: 存在しないエンティティへの参照は制約 C-RF-001 に違反する

## マイグレーション (B-M)

### B-M-001: インポート時の identifierType 補完

**トリガー**: tm_import_diagram が実行される
**動作**: 各属性について:
- identifierType が未設定かつ isIdentifier: true → identifierType: 'own' に補完
- identifierType が未設定かつ isIdentifier: false → identifierType: null に補完
- referenceId が未設定 → null に補完

根拠: 旧フォーマットとの後方互換性

### B-M-002: インポート時の isDerived 補完

**トリガー**: tm_import_diagram が実行される
**動作**: isDerived が未設定の属性に isDerived: false を補完する

根拠: 旧フォーマットとの後方互換性
