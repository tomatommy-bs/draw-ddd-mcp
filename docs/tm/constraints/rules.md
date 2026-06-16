# Layer 2: 制約ルール

validate_model の根拠となる全ルール一覧。各ルールは Layer 1 (theory) の公理に帰着する。

## ルール命名規則

`C-{カテゴリ}-{番号}`

- C-E: エンティティ全般（R, E, C, M 共通）
- C-R: Resource 固有
- C-V: Event 固有
- C-C: Correspondence 固有
- C-M: Mapping 固有
- C-A: 属性
- C-I: 識別子
- C-RF: 参照
- C-S: サブセット

## エンティティ全般 (C-E)

### C-E-001: エンティティは名前を持つ (error)
すべてのエンティティ（R, E, C, M）は空でない名前を持たなければならない。

根拠: 名前のない管理対象は存在しない。

### C-E-002: エンティティは1つ以上の識別子を持つ (error)
すべてのエンティティは少なくとも1つの個体指定子（isIdentifier: true）を持たなければならない。

根拠: 公理 A2 — T字型構造の左列が空であることは許されない。

### C-E-003: エンティティは1つ以上の属性を持つべき (warning)
属性（右列）が1つもないエンティティは不完全である。

根拠: 公理 A2 — T字型構造には左列と右列の両方が期待される。

## Resource 固有 (C-R)

### C-R-001: basic Resource の固有識別子は厳密に1つ (error)
subtype: basic の Resource は、identifierType: 'own' の属性を厳密に1つ持たなければならない。

根拠: 公理 A4 — basic Resource は「固有指定子を1つ持つ独立したエンティティ」。

### C-R-002: basic Resource は参照識別子を持たない (error)
subtype: basic の Resource は、identifierType: 'reference' の属性を持ってはならない。

根拠: 公理 A4 — Resource は他のエンティティを参照しない。R-R の関係は Correspondence で表現する。


## Event 固有 (C-V)

### C-V-001: Event は少なくとも1つのエンティティを参照する (error)
すべての Event は、少なくとも1つのエンティティ（R または E）を参照しなければならない。

根拠: 公理 A5 — Event は「必ず1つ以上のエンティティを参照する（単独では存在しない）」。

### C-V-002: Event は時間属性を持つべき (warning)
Event は日時・日付型の属性を少なくとも1つ持つことが推奨される。

根拠: 公理 A5 — Event は「時間属性を持つべきである」。

判定方法: dataType が 'date', 'datetime', 'timestamp' のいずれかに該当する属性が右列に存在するか。

### C-V-003: Event の参照連鎖は Resource に到達する (error)
Event から参照の連鎖を辿った際、最終的に少なくとも1つの Resource に到達しなければならない。Event だけで閉じた参照ループは不可。

根拠: 公理 A6 — Event だけで閉じたループは「何についてのイベントか」が不明であり、モデルとして無意味。

### C-V-004: Event は R → E の方向で参照されない (error)
Resource が Event を参照する Reference は存在してはならない。方向は常に E → R。

根拠: 公理 A5 — R → E は存在しない。

## Correspondence 固有 (C-C)

### C-C-001: Correspondence は厳密に2つの参照先を持つ (error)
Correspondence は厳密に2つの参照先（R×R または C×R）への Reference を持たなければならない。

根拠: 公理 A4 — Correspondence は厳密に2つの R 系エンティティを橋渡しする。

### C-C-002: Correspondence の参照先は R または C のみ (error)
Correspondence の参照先は Resource または別の Correspondence のみ。Event や Mapping を参照してはならない。

根拠: 公理 A4 — C は R 系の関係構造。E や M との関係はない。

### C-C-003: Correspondence の参照先は異なる2つのエンティティ (error)
Correspondence の2つの参照先は異なるエンティティでなければならない（同一エンティティへの2回参照は recursive であり、C ではない）。

## Recursive 固有 (C-Re)

### C-Re-001: Recursive は同一の R を参照する (error)
Recursive の2つの参照先は同一の Resource でなければならない。

根拠: 公理 A4 — Recursive は同一 R の自己参照構造。

### C-Re-002: Recursive は own 識別子を持たない (error)
Recursive は identifierType: 'own' の属性を持ってはならない。同一 R の参照指定子2つのみで識別される。

### C-Re-003: Recursive の参照識別子は同名で2つ (error)
Recursive の左列は同一 R の own を2回借用した同名の参照指定子で構成されなければならない。identifierOrder で区別する。

## Mapping 固有 (C-M)

### C-M-001: Mapping は厳密に2つの Event を参照する (error)
Mapping は厳密に2つの異なる Event への Reference を持たなければならない。

根拠: 公理 A6 — Mapping は E×E の対応関係。

### C-M-002: Mapping の参照先は E のみ (error)
Mapping の参照先は Event のみ。Resource, Correspondence, 別の Mapping を参照してはならない。

根拠: 公理 A6 — M は E 系の関係構造。

### C-M-003: Mapping は own 識別子を持たない (error)
Mapping は identifierType: 'own' の属性を持ってはならない。2つの E の参照指定子のみで一意に決まる。

## 属性 (C-A)

### C-A-001: 識別子の identifierType は own または reference (error)
isIdentifier: true の属性は、identifierType が 'own' または 'reference' でなければならない（null は不可）。

根拠: 公理 A3 — 個体指定子は own と reference のみに分類される。

### C-A-002: 非識別子の identifierType は null (error)
isIdentifier: false の属性は、identifierType が null でなければならない。

根拠: 公理 A2 — 左列と右列の分離は厳密。

### C-A-003: reference 属性は referenceId を持つ (error)
identifierType: 'reference' の属性は、referenceId が null でない有効な TMReference ID を持たなければならない。

根拠: 公理 A7 — 参照指定子は Reference から導出される。

### C-A-004: 導出属性は識別子にならない (error)
isDerived: true の属性は isIdentifier: true にはなれない。

根拠: theory/attribute.md — 導出属性は右列に配置される。

## 識別子 (C-I)

### C-I-001: identifierOrder は識別子間で一意 (error)
同一エンティティ内の isIdentifier: true の属性群において、identifierOrder は重複してはならない。

根拠: 複合識別子の順序は明確でなければならない。

### C-I-002: identifierOrder は連番である (warning)
identifierOrder は 1 から始まる連番であることが推奨される。

## 参照 (C-RF)

### C-RF-001: Reference の source/target は存在するエンティティ (error)
sourceEntityId と targetEntityId は、ダイアグラム上に存在するエンティティを指さなければならない。

### C-RF-002: reference 属性の referenceId は存在する Reference (error)
属性の referenceId が指す Reference がダイアグラム上に存在しなければならない。

### C-RF-003: 未参照エンティティ (warning)
どの Reference にも関与しないエンティティは、モデルの不完全さを示す可能性がある。ただし basic R は参照しない側なので、参照される側としてのみ評価する。

### C-RF-004: 禁止された参照方向 (error)
以下の参照方向は存在してはならない:
- R → R（Resource が Resource を直接参照。C または Re を介す）
- R → E（Resource が Event を参照）
- C → E, C → M, C → Re（Correspondence は R/C とのみ関係）
- Re → E, Re → C, Re → M（Recursive は同一 R とのみ関係）
- M → R, M → C, M → Re, M → M（Mapping は E とのみ関係）

根拠: 関係マトリックス（entities.md）

## サブセット (C-S)

### C-S-001: subset は親 Reference を厳密に1つ持つ (error)
subtype: subset のエンティティは、source として厳密に1つの Reference を持たなければならない。

根拠: 公理 A8 — サブセットは1つの親から特化される。

### C-S-002: subset は own 識別子を持たない (error)
subtype: subset のエンティティは、identifierType: 'own' の属性を持ってはならない。

根拠: 公理 A8 — サブセットは親の指定子のみで識別される。

### C-S-003: subset の親は存在する (error)
subset の親 Reference が指す target エンティティがダイアグラム上に存在しなければならない。
