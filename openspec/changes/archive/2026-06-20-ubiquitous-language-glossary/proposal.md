## Why

AI との TM モデリング会話の中で用語の選択理由・却下理由・文脈が自然に生まれるが、それらはチャットログに流れて消える。TM モデルは構造（エンティティ・属性・参照）を捉えるが、「なぜこの言葉を選んだのか」「誰がどの場面で使うのか」といったユビキタス言語の意味論的な情報は保持しない。用語の定義が散逸すると、エンジニアとプロダクトメンバー間で言葉の不整合が生まれ、TM モデリングの価値が減損する。

## What Changes

- TM モデルとは独立した用語集（Glossary）データモデルを追加する
- 用語の定義文中に `[[R:名前]]` `[[E:名前]]` 形式の構造化参照を導入し、TM モデル要素への参照を自然言語から分離する
- GUI にサイドバー型の Glossary パネルを追加する
  - 用語定義中の参照をクリックするとキャンバス上のエンティティにフォーカスする
  - キャンバス上のエンティティをフォーカスすると、関連する用語でサイドバーをフィルタする
  - 壊れた参照（TM モデルに存在しないエンティティへの参照）を視覚的に警告する
- MCP ツール群（`tm_add_term`, `tm_update_term`, `tm_delete_term`, `tm_list_terms`）を追加する
- AI がモデリング中に用語登録を提案し、ユーザーが承認するフローを実現する

## Capabilities

### New Capabilities
- `glossary-data-model`: 用語集のデータ構造と保存。用語エントリ（name, definition, context, rejected alternatives, entity_ref）の CRUD と構造化参照 `[[R:名前]]` `[[E:名前]]` の構文定義
- `glossary-mcp-tools`: 用語集を操作する MCP ツール群（tm_add_term, tm_update_term, tm_delete_term, tm_list_terms）
- `glossary-sidebar`: GUI のサイドバー型 Glossary パネル。用語一覧・検索・追加・編集。参照のレンダリングと壊れた参照の警告表示
- `glossary-canvas-navigation`: Glossary とキャンバス間の双方向ナビゲーション。参照クリックでエンティティフォーカス、エンティティフォーカスで関連用語フィルタ

### Modified Capabilities

(なし)

## Impact

- **Backend**: `src/tm/` に用語集ドメインロジック追加。`src/mcp/primitives/tm/tools/` に 4 ツール追加。WebSocket プロトコルに用語集関連コマンド追加
- **GUI**: サイドバーコンポーネント追加。`DiagramContext` に用語集状態を追加または別 Context を新設。キャンバスのエンティティクリックイベントにフィルタ連動ロジック追加
- **WebSocket プロトコル**: 用語集の CRUD コマンド追加（`addTerm`, `updateTerm`, `deleteTerm`, `listTerms`）
- **tm-modeler エージェント**: モデリング操作時に用語提案を行う振る舞いの追加
