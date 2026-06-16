# 参照 (Reference)

根拠: 公理 A3, A7

## 定義

2つのエンティティ間の関係。source エンティティが target エンティティを参照する。

参照が確定すると、target の固有指定子が source の左列に reference として自動出現する（公理 A7: 構造決定性）。

## 方向性

Reference には方向がある: **source → target**

- source: 参照する側（参照指定子を受け取る側）
- target: 参照される側（固有指定子を提供する側）

```
受注(E, source) → 顧客(R, target)
  → 受注の左列に「顧客NO(R)」が出現
  → 顧客の構造は変化しない
```

## 許可される参照方向

関係マトリックス（entities.md）に基づく:

| source | target | 許可 | 例 |
|--------|--------|------|-----|
| E | R | ✓ | 受注 → 顧客 |
| E | E | ✓ (1:N) | 出荷 → 受注 |
| C | R | ✓ | 取引先品目 → 品目 |
| C | C | ✓ (連鎖) | 取引先品目倉庫 → 取引先品目 |
| M | E | ✓ | 受注請求対応 → 受注 |
| R (recursive) | R | ✓ (自己参照) | 部品構成 → 部品 |
| R/E (subset) | R/E | ✓ (親参照) | 法人顧客 → 顧客 |

禁止される方向（制約 C-RF-004）:
- R → E, R → R（直接）, C → E, C → M, M → R, M → C, M → M

## Cardinality（多重度）

| 値 | 意味 | 用途 |
|----|------|------|
| 1:1 | source 1件に対し target 1件 | subset → 親 |
| N:1 | source N件に対し target 1件 | E → R、E → E (1:N) |

TM における最も一般的な cardinality は **N:1**（多対一）。source 側が「多」。

## 構造決定性（公理 A7）

Reference を定義することで、source の左列に追加される参照指定子は**自動的に決まる**。

### 基本パターン: E → R

```
tm_add_reference(source: 受注(E), target: 顧客(R))
  1. 顧客の own 識別子を取得: [顧客NO]
  2. 受注の左列に自動追加: 顧客NO(R)
```

### target が複合識別子を持つ場合

target の own 識別子がすべて source に転写される。

### C × R 連鎖

target が C のとき、C の参照指定子群（= C が借用しているすべての識別子）が source に転写される。

```
取引先品目(C) の左列: [取引先コード(R), 品目コード(R)]
取引先品目倉庫(C) = 取引先品目(C) × 倉庫(R)
  → 左列: [取引先コード(R), 品目コード(R), 倉庫コード(R)]
```

### recursive

同一 R の own 識別子が2セット転写される。2つの参照指定子は同名で、identifierOrder で区別する。

## Reference の削除

Reference を削除すると、その Reference に紐づく参照指定子も連動削除される。
source エンティティの左列から、referenceId が一致する属性がすべて除去される。
