# MCP ツール定義: draw-ddd-mcp

## 設計方針

drawdb-mcp の CRUD パターンを踏襲しつつ、TM 手法の概念を第一級オブジェクトとして扱う。

### drawdb-mcp との対応

| drawdb-mcp | draw-ddd-mcp | 備考 |
|---|---|---|
| Table | Resource / Event | TM の R/E 分類が第一級 |
| Field | Attribute | 個体指定子(identifier)の概念を追加 |
| Relationship | Reference | Event→Resource の参照関係 |
| Area | BoundedContext / Aggregate | Phase 2 で DDD 概念を追加 |
| Note | Note | そのまま流用 |
| Enum / Type | ― | TM では不要（DB固有概念のため） |

### 内部データモデル

```typescript
// === TM エンティティ ===

interface TMEntity {
  id: string                          // nanoid
  name: string                        // エンティティ名（例: "顧客"）
  type: "resource" | "event"          // TM の分類
  subtype:                            // 下位分類
    | "basic"                         // 基本 R / 基本 E
    | "recursive"                     // 再帰的 R / 再帰的 E（自己参照・連鎖）
    | "correspondence"                // 対照 R（静的対応）/ 明細 E
  color: string                       // 表示色
  x: number                           // Canvas X 座標
  y: number                           // Canvas Y 座標
  comment: string                     // 補足コメント
}

// === 属性 ===

interface TMAttribute {
  id: string                          // nanoid
  entityId: string                    // 所属エンティティ
  name: string                        // 属性名（例: "顧客コード"）
  dataType: string                    // データ型（例: "VARCHAR(50)"）
  isIdentifier: boolean               // 個体指定子か否か
  identifierOrder: number | null      // 複合個体指定子の順序（null = 非識別子）
  isRequired: boolean                 // NOT NULL
  default: string                     // デフォルト値
  comment: string                     // 補足
}

// === 参照（リレーションシップ） ===

interface TMReference {
  id: string                          // nanoid
  sourceEntityId: string              // 参照元（通常 Event）
  targetEntityId: string              // 参照先（通常 Resource、または先行 Event）
  sourceAttributeId: string           // FK 属性
  targetAttributeId: string           // PK 属性
  cardinality: "1:1" | "1:N" | "N:1" // カーディナリティ
  label: string                       // 関連の意味ラベル（例: "注文者"）
  comment: string
}

// === Note ===

interface TMNote {
  id: string
  content: string                     // テキスト内容
  x: number
  y: number
  width: number
  height: number
  color: string
}

// === ダイアグラム全体 ===

interface TMDiagram {
  entities: TMEntity[]
  attributes: TMAttribute[]
  references: TMReference[]
  notes: TMNote[]
  metadata: {
    name: string                      // ダイアグラム名
    createdAt: string
    updatedAt: string
  }
}
```

---

## Phase 1: TM モデリングツール

### カテゴリ一覧

```
Phase 1 ツール (TM モデリング)
├── Entity 操作
│   ├── add_resource          Resource を追加
│   ├── add_event             Event を追加
│   ├── update_entity         エンティティを更新
│   ├── delete_entity         エンティティを削除
│   ├── get_entity            エンティティを取得
│   └── list_entities         全エンティティを一覧
│
├── Attribute 操作
│   ├── add_attribute         属性を追加
│   ├── update_attribute      属性を更新
│   ├── delete_attribute      属性を削除
│   └── set_identifier        個体指定子を設定
│
├── Reference 操作
│   ├── add_reference         参照関係を追加
│   ├── update_reference      参照関係を更新
│   └── delete_reference      参照関係を削除
│
├── Note 操作
│   ├── add_note              注釈を追加
│   ├── update_note           注釈を更新
│   └── delete_note           注釈を削除
│
├── Diagram 操作
│   ├── get_diagram           ダイアグラム全体を取得
│   ├── import_diagram        ダイアグラムをインポート
│   ├── export_diagram        ダイアグラムを JSON エクスポート
│   └── auto_layout           TM 慣例に従い自動配置
│
└── TM 分析・検証
    ├── validate_model        VEA マトリクス検証
    └── export_vea_matrix     VEA マトリクスを出力
```

---

### Entity 操作

#### `add_resource`

Resource エンティティを Canvas に追加する。

```yaml
name: add_resource
description: >
  TM の Resource（独立エンティティ）を追加する。
  Resource は独自の識別子を持ち、他のエンティティに依存せず存在する。
  例: 顧客、商品、倉庫、社員

parameters:
  name:
    type: string
    required: true
    description: Resource 名

  subtype:
    type: enum ["basic", "recursive", "correspondence"]
    default: "basic"
    description: >
      basic: 基本 Resource（独自コード体系を持つ）
      recursive: 再帰的 Resource（自己参照を持つ、例: 組織の階層）
      correspondence: 対照 Resource（R×R の恒常的対応、例: 顧客担当）

  attributes:
    type: array
    required: false
    description: 初期属性の配列
    items:
      name: string
      dataType: string
      isIdentifier: boolean (default: false)
      isRequired: boolean (default: false)
      default: string (default: "")
      comment: string (default: "")

  x: { type: number, default: auto }
  y: { type: number, default: auto }
  color: { type: string, default: "#2563eb" }  # 青系（Resource のデフォルト色）
  comment: { type: string, default: "" }

returns:
  entityId: string
  attributeIds: { name: string, id: string }[]
```

#### `add_event`

Event エンティティを Canvas に追加する。

```yaml
name: add_event
description: >
  TM の Event（対照表エンティティ）を追加する。
  Event は2つ以上の Resource（または先行 Event）間の対応関係・出来事を記録する。
  例: 受注、出荷、請求、在庫

parameters:
  name:
    type: string
    required: true
    description: Event 名

  subtype:
    type: enum ["basic", "recursive", "correspondence"]
    default: "basic"
    description: >
      basic: 基本 Event（R×R の対照表）
      recursive: 再帰的 Event（先行 Event の後続、例: 受注→出荷）
      correspondence: 明細 Event（E×R の内訳、例: 受注明細）

  attributes:
    type: array
    required: false
    description: 初期属性の配列（add_resource と同じスキーマ）

  x: { type: number, default: auto }
  y: { type: number, default: auto }
  color: { type: string, default: "#dc2626" }  # 赤系（Event のデフォルト色）
  comment: { type: string, default: "" }

returns:
  entityId: string
  attributeIds: { name: string, id: string }[]
```

#### `update_entity`

既存エンティティのプロパティを更新する。Resource / Event 共通。

```yaml
name: update_entity
description: >
  エンティティの名前、種別、位置、色、コメントを更新する。
  type (resource/event) の変更も可能だが、参照関係の整合性チェックが走る。

parameters:
  entityId:
    type: string
    required: true

  # 以下すべて optional — 指定したもののみ更新
  name: { type: string }
  type: { type: enum ["resource", "event"] }
  subtype: { type: enum ["basic", "recursive", "correspondence"] }
  x: { type: number }
  y: { type: number }
  color: { type: string }
  comment: { type: string }

returns:
  success: boolean
  warnings: string[]    # type 変更時の整合性警告など
```

#### `delete_entity`

エンティティを削除する。関連する属性・参照も連鎖削除される。

```yaml
name: delete_entity
description: >
  エンティティとその全属性、関連する参照関係を削除する。

parameters:
  entityId:
    type: string
    required: true

returns:
  success: boolean
  deletedAttributes: number
  deletedReferences: number
```

#### `get_entity`

エンティティの詳細を取得する。

```yaml
name: get_entity
description: エンティティの全情報（属性・参照含む）を取得する。

parameters:
  entityId: { type: string, required: false }
  entityName: { type: string, required: false }
  # いずれか一方を指定

returns:
  entity: TMEntity
  attributes: TMAttribute[]
  outgoingReferences: TMReference[]    # このエンティティが参照元
  incomingReferences: TMReference[]    # このエンティティが参照先
```

#### `list_entities`

全エンティティを一覧する。フィルタ可能。

```yaml
name: list_entities
description: ダイアグラム上の全エンティティを一覧する。

parameters:
  type: { type: enum ["resource", "event"], required: false }
  subtype: { type: enum ["basic", "recursive", "correspondence"], required: false }

returns:
  entities: TMEntity[]
  count: number
```

---

### Attribute 操作

#### `add_attribute`

エンティティに属性を追加する。

```yaml
name: add_attribute
description: 指定エンティティに属性を追加する。

parameters:
  entityId:
    type: string
    required: true

  name:
    type: string
    required: true

  dataType:
    type: string
    required: true
    description: "例: VARCHAR(50), INTEGER, DATE, DECIMAL(10,2)"

  isIdentifier:
    type: boolean
    default: false
    description: 個体指定子に含めるかどうか

  identifierOrder:
    type: number
    required: false
    description: 複合個体指定子での順序（1始まり）。isIdentifier=true の場合のみ有効

  isRequired:
    type: boolean
    default: false

  default: { type: string, default: "" }
  comment: { type: string, default: "" }

returns:
  attributeId: string
```

#### `update_attribute`

属性を更新する。

```yaml
name: update_attribute
description: 既存の属性を更新する。

parameters:
  attributeId:
    type: string
    required: true

  # 以下すべて optional
  name: { type: string }
  dataType: { type: string }
  isIdentifier: { type: boolean }
  identifierOrder: { type: number }
  isRequired: { type: boolean }
  default: { type: string }
  comment: { type: string }

returns:
  success: boolean
```

#### `delete_attribute`

属性を削除する。参照関係で使用中の場合は警告。

```yaml
name: delete_attribute
description: 属性を削除する。この属性を使用する参照関係も削除される。

parameters:
  attributeId:
    type: string
    required: true

returns:
  success: boolean
  deletedReferences: number
```

#### `set_identifier`

個体指定子を一括設定する。既存の identifier 設定をリセットして再設定。

```yaml
name: set_identifier
description: >
  エンティティの個体指定子を一括設定する。
  指定した属性のみが identifier となり、既存の設定はリセットされる。
  Resource は通常単独、Event は複合になる。

parameters:
  entityId:
    type: string
    required: true

  attributeIds:
    type: string[]
    required: true
    description: 個体指定子とする属性のID配列（順序が identifierOrder になる）

returns:
  success: boolean
  identifierAttributes: { name: string, order: number }[]
```

---

### Reference 操作

#### `add_reference`

エンティティ間の参照関係を追加する。

```yaml
name: add_reference
description: >
  参照関係を追加する。TM では典型的に Event→Resource の参照。
  Event→Event の参照（再帰的 Event の連鎖）も可能。
  sourceAttributeId を指定すると FK-PK の紐付けが明示される。

parameters:
  sourceEntityId:
    type: string
    required: true
    description: 参照元エンティティ（FK を持つ側。通常 Event）

  targetEntityId:
    type: string
    required: true
    description: 参照先エンティティ（PK を持つ側。通常 Resource）

  sourceAttributeId:
    type: string
    required: false
    description: FK 属性。未指定なら自動作成される

  targetAttributeId:
    type: string
    required: false
    description: PK 属性。未指定なら対象エンティティの identifier を使用

  cardinality:
    type: enum ["1:1", "1:N", "N:1"]
    default: "N:1"
    description: >
      N:1 がデフォルト（多くの Event が 1つの Resource を参照）。
      source が N 側、target が 1 側。

  label:
    type: string
    default: ""
    description: "関連の意味（例: '注文者', '出荷先'）"

  comment: { type: string, default: "" }

returns:
  referenceId: string
  autoCreatedAttributeId: string | null   # FK を自動作成した場合
```

#### `update_reference`

```yaml
name: update_reference
description: 参照関係を更新する。

parameters:
  referenceId: { type: string, required: true }
  cardinality: { type: enum ["1:1", "1:N", "N:1"] }
  label: { type: string }
  comment: { type: string }

returns:
  success: boolean
```

#### `delete_reference`

```yaml
name: delete_reference
description: 参照関係を削除する。関連する FK 属性は残る。

parameters:
  referenceId: { type: string, required: true }

returns:
  success: boolean
```

---

### Note 操作

#### `add_note` / `update_note` / `delete_note`

drawdb-mcp と同じパターン。Canvas 上に自由テキストの注釈を配置する。
ユビキタス言語の定義や要件メモに使用。

```yaml
# add_note
parameters:
  content: { type: string, required: true }
  x: { type: number, default: 100 }
  y: { type: number, default: 100 }
  width: { type: number, default: 200 }
  height: { type: number, default: 100 }
  color: { type: string, default: "#fbbf24" }
returns:
  noteId: string

# update_note
parameters:
  noteId: { type: string, required: true }
  content: { type: string }
  x: { type: number }
  y: { type: number }
  width: { type: number }
  height: { type: number }
  color: { type: string }
returns:
  success: boolean

# delete_note
parameters:
  noteId: { type: string, required: true }
returns:
  success: boolean
```

---

### Diagram 操作

#### `get_diagram`

ダイアグラム全体の状態を取得する。

```yaml
name: get_diagram
description: >
  現在のダイアグラム全体（エンティティ、属性、参照、ノート、メタデータ）を取得する。
  AI がモデルの全体像を把握するために使用。

parameters: なし

returns:
  TMDiagram 全体
```

#### `import_diagram`

JSON からダイアグラムをインポートする。

```yaml
name: import_diagram
description: TMDiagram JSON をインポートして現在のダイアグラムを置き換える。

parameters:
  diagram:
    type: TMDiagram
    required: true
  clearCurrent:
    type: boolean
    default: true

returns:
  success: boolean
  entityCount: number
  referenceCount: number
```

#### `export_diagram`

ダイアグラムを JSON でエクスポートする。

```yaml
name: export_diagram
description: 現在のダイアグラムを TMDiagram JSON としてエクスポートする。

parameters: なし

returns:
  diagram: TMDiagram
```

#### `auto_layout`

TM の慣例に従って自動配置する。

```yaml
name: auto_layout
description: >
  TM の慣例に従ってエンティティを自動配置する。
  Resource を上段、Event を下段に配置し、
  業務フローの連鎖（再帰的 Event）を時系列順に並べる。

parameters:
  strategy:
    type: enum ["standard", "flow", "compact"]
    default: "standard"
    description: >
      standard: R上段・E下段の基本配置
      flow: 業務フローの連鎖を縦方向に展開
      compact: 最小スペースで配置

returns:
  success: boolean
  movedEntities: { entityId: string, x: number, y: number }[]
```

---

### TM 分析・検証

#### `validate_model`

TM の規則に基づいてモデルを検証する。

```yaml
name: validate_model
description: >
  現在のモデルを TM の規則に基づいて検証し、問題点を報告する。
  
  検証項目:
  - すべての Entity に個体指定子があるか
  - Resource の個体指定子が単独か
  - Event が少なくとも1つの Resource を参照しているか
  - 属性がいずれかの Entity に所属しているか
  - 属性の重複がないか（FK を除く）
  - 対照 Resource が2つの Resource を参照しているか
  - 明細 Event が親 Event を参照しているか

parameters: なし

returns:
  valid: boolean
  errors: ValidationIssue[]     # 修正必須
  warnings: ValidationIssue[]   # 推奨事項

# ValidationIssue:
#   entityId: string | null
#   attributeId: string | null
#   rule: string              # どの規則に違反しているか
#   message: string           # 人が読める説明
#   severity: "error" | "warning"
```

#### `export_vea_matrix`

VEA マトリクスをテキストとして出力する。

```yaml
name: export_vea_matrix
description: >
  VEA (Verify Entity and Attribute) マトリクスを生成する。
  行が属性、列がエンティティのマトリクスで、各セルに PK/FK/○/- を表示。
  モデルの完全性と正確性を人間が目視確認するためのツール。

parameters:
  format:
    type: enum ["text", "markdown", "csv"]
    default: "markdown"

returns:
  matrix: string              # フォーマットされたマトリクス文字列
  summary:
    totalEntities: number
    totalAttributes: number
    orphanedAttributes: number    # どの Entity にも属さない属性
    duplicatedAttributes: string[] # 複数 Entity に重複する属性名
```

---

## Phase 2: DDD 集約マッピングツール（将来拡張）

Phase 1 のモデルが安定した後に追加するツール群。

```
Phase 2 ツール (DDD 集約)
├── Aggregate 操作
│   ├── add_aggregate           集約境界を定義
│   ├── update_aggregate        集約を更新
│   ├── delete_aggregate        集約を削除
│   ├── assign_to_aggregate     エンティティを集約に割り当て
│   └── remove_from_aggregate   エンティティを集約から除外
│
├── BoundedContext 操作
│   ├── add_bounded_context     境界づけられたコンテキストを追加
│   ├── update_bounded_context
│   ├── delete_bounded_context
│   └── assign_aggregate        集約をコンテキストに割り当て
│
├── DDD 分析
│   ├── suggest_aggregates      TM モデルから集約を推定
│   └── validate_aggregates     集約の整合性を検証
│
└── エクスポート
    └── export_ddd_model        DDD モデルとして出力
```

Phase 2 の詳細な型定義:

```typescript
interface DDDAggregate {
  id: string
  name: string
  rootEntityId: string              // Aggregate Root（TM Entity）
  memberEntityIds: string[]         // 集約内のエンティティ
  color: string
  x: number
  y: number
  width: number
  height: number
}

interface DDDBoundedContext {
  id: string
  name: string
  aggregateIds: string[]
  color: string
  x: number
  y: number
  width: number
  height: number
}
```

---

## ツール数の比較

| | drawdb-mcp | draw-ddd-mcp Phase 1 | draw-ddd-mcp Phase 2 |
|---|---|---|---|
| Entity/Table 系 | 6 (add/update/delete/get table + get_diagram + list) | 6 (add_resource + add_event + update/delete/get/list entity) | ― |
| Field/Attribute 系 | 3 (add/update/delete field) | 4 (add/update/delete attribute + set_identifier) | ― |
| Relationship/Reference 系 | 3 (add/update/delete) | 3 (add/update/delete) | ― |
| Area → Aggregate/BC | 3 (add/update/delete area) | ― | 8 |
| Note | 3 | 3 | ― |
| Enum/Type | 6 | ― | ― |
| Diagram | 3 (get/import/export) | 4 (get/import/export + auto_layout) | ― |
| Export | 3 (SQL/DBML import+export) | 2 (validate + VEA matrix) | 2 (suggest + export) |
| その他 | 1 (set_database) | ― | ― |
| **合計** | **31** | **22** | **10** |

Phase 1 は 22 ツールでスタートし、Phase 2 で 10 ツール追加して合計 32 ツール。
