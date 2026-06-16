# Subtype と構造パターン

根拠: 公理 A4, A6, A8

## 概要

Subtype はエンティティの構造パターンを示す。R と E にのみ適用される。C, Re, M は subtype を持たない（それ自体が関係の型である）。

## 型別の subtype

| 型 | 適用される subtype |
|----|-------------------|
| Resource (R) | basic, subset |
| Event (E) | basic, subset |
| Correspondence (C) | なし |
| Recursive (Re) | なし |
| Mapping (M) | なし |

## Resource の subtype

### basic

最も基本的な Resource。固有指定子を1つ持ち、他を参照しない。

| 性質 | 値 |
|------|-----|
| own 識別子 | 厳密に1つ |
| reference 識別子 | 0（他を参照しない） |
| R の例 | 顧客、商品、部品、倉庫、社員 |

### subset

親 Resource の特化（is-a 関係）。

| 性質 | 値 |
|------|-----|
| own 識別子 | 0（持たない） |
| reference 識別子 | 1セット（親の own を継承） |
| 親 Reference | 厳密に1つ |
| 親との cardinality | 1:1 |
| R の例 | 法人顧客 ⊂ 顧客、正社員 ⊂ 社員 |

サブセットのルール:
- 親に**区分属性（discriminator）**が存在すること
- 同一親から複数のサブセットが分岐しうる
- サブセットは親にはない固有の属性を右列に持つ
- サブセットの全レコードは、親にも対応するレコードが存在する

## Event の subtype

### basic

基本的な Event。1つ以上の R（または E）を参照し、固有指定子を持つ。

| 性質 | 値 |
|------|-----|
| own 識別子 | 1つ以上 |
| reference 識別子 | 1つ以上（R や E への参照） |
| E の例 | 受注、出荷、支払、請求 |

### subset

親 Event の特化。

| 性質 | 値 |
|------|-----|
| own 識別子 | 0（持たない） |
| reference 識別子 | 1セット（親の own を継承） |
| 親 Reference | 厳密に1つ |
| E の例 | クレジット支払 ⊂ 支払 |

## subtype の判定フロー

```
Resource の判定:

  親 R の特化（is-a）か？
    └── Yes → subset
    └── No → basic

Event の判定:

  親 E の特化（is-a）か？
    └── Yes → subset
    └── No → basic
```

## C, Re, M は subtype を持たない

C, Re, M はそれ自体が関係の型であり、subtype による分類は不要。

| 型 | 構成 | 例 |
|----|------|-----|
| C | R × R（異なる） | 取引先品目 = 取引先 × 品目 |
| C | C × R（連鎖） | 取引先品目倉庫 = 取引先品目(C) × 倉庫(R) |
| Re | R × R（同一） | 部品構成 = 部品 × 部品 |
| M | E × E | 受注請求対応 = 受注 × 請求 |
