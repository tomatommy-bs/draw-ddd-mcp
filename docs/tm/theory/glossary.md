# 用語集

TM 手法の用語、日本語名、コード内での名称の対応。

## エンティティ関連

| TM 用語 | 日本語 | コード名 | 説明 |
|---------|--------|----------|------|
| Resource | リソース | `type: 'resource'` | 管理対象の「モノ」。他を参照しない |
| Event | イベント | `type: 'event'` | 時点で発生する「コト」。R/E を参照する |
| Correspondence | 対照表 | `type: 'correspondence'` | R 系の関係構造（R×R, C×R） |
| Recursive | 再帰表 | `type: 'recursive'` | 同一 R の自己参照構造 |
| Mapping | 対応表 | `type: 'mapping'` | E 系の関係構造（E×E） |
| Entity | エンティティ | `TMEntity` | R, E, C, Re, M の総称 |
| Subtype | サブタイプ | `EntitySubtype` | エンティティの構造パターン |

## Subtype

| TM 用語 | 日本語 | コード名 | 適用先 | 説明 |
|---------|--------|----------|--------|------|
| Basic | 基本 | `'basic'` | R, E | 標準的なエンティティ |
| Subset | サブセット | `'subset'` | R, E | 親の特化（is-a） |

## 属性関連

| TM 用語 | 日本語 | コード名 | 説明 |
|---------|--------|----------|------|
| Identifier | 個体指定子 | `isIdentifier: true` | レコードを一意に特定する属性 |
| Own Identifier | 固有指定子 | `identifierType: 'own'` | エンティティ自身の識別子 |
| Reference Identifier | 参照指定子 | `identifierType: 'reference'` | 他エンティティから借用した識別子 |
| Descriptor | 状態記述子 | `isIdentifier: false` | 個体の状態を記述する属性 |
| Derived Attribute | 導出属性 | `isDerived: true` | 他の属性から計算可能な属性 |
| Discriminator | 区分属性 | (未実装) | サブセット分解の基準属性 |

## 関係

| TM 用語 | 日本語 | コード名 | 説明 |
|---------|--------|----------|------|
| Reference | 参照 | `TMReference` | エンティティ間の関係 |
| Cardinality | 多重度 | `Cardinality` | 関係の数量比（1:1, 1:N, N:1） |
| Source | 参照元 | `sourceEntityId` | 参照する側 |
| Target | 参照先 | `targetEntityId` | 参照される側 |

## 構造パターン

| TM 用語 | 日本語 | 説明 |
|---------|--------|------|
| T字型構造 | T-shaped structure | 左列(指定子) + 右列(属性) のレイアウト |
| Superset/Subset | スーパーセット/サブセット | 区分属性による is-a 分解 |
| Structural Determinism | 構造決定性 | 参照から左列が自動決定される性質 |
