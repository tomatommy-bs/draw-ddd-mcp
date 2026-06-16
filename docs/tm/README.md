# TM (T字型ER手法) 知識体系

本ディレクトリは、draw-ddd-mcp が依拠する TM モデリング手法の理論・制約・自動化ルールを体系的に定義する。

MCP tool の description、validation ロジック、自動生成ロジックはすべてここに定義された理論を根拠とする。

## 型体系

| 型 | 意味 | 性質 |
|----|------|------|
| Resource (R) | モノ | 時間非依存。独立。他を参照しない |
| Event (E) | コト | 時間依存。R/E を参照する |
| Correspondence (C) | 対照表 | 異なる R 系の関係構造（R×R, C×R） |
| Recursive (Re) | 再帰表 | 同一 R の自己参照構造 |
| Mapping (M) | 対応表 | E 系の関係構造（E×E） |

## 構造

```
docs/tm/
├── theory/              Layer 1: 知識（TM 理論そのもの）
│   ├── entities.md        エンティティの定義（R/E/C/M、T字型構造）
│   ├── grammar.md         関係文法（参照、subtype、構造決定性）
│   ├── resource.md        Resource の subtype 別構造
│   ├── event.md           Event の subtype 別構造
│   ├── identifier.md      個体指定子の理論
│   ├── attribute.md       属性の分類
│   ├── reference.md       参照の理論
│   ├── subtype.md         subtype の定義と判定フロー
│   └── glossary.md        用語集
│
├── constraints/         Layer 2: 制約（validation ルール）
│   └── rules.md           全ルール一覧と根拠
│
└── behavior/            Layer 3: 振る舞い（自動化ルール）
    └── automations.md     自動生成・自動削除の仕様
```

## レイヤーの関係

```
Layer 1 (theory)    TM 手法の理論・定義
       ↓ 導出
Layer 2 (constraints)  理論から導かれる構造制約（validate_model の根拠）
       ↓ 導出
Layer 3 (behavior)     制約から自明な操作の自動化（参照識別子の自動生成 等）
```

各レイヤーのルールには ID を付与し、上位レイヤーへの根拠参照を明記する。
