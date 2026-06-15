# AI 判断事項

実装にあたり AI が自律的に判断した設計決定の記録。

## アーキテクチャ

### monorepo 構成
- pnpm workspaces + Turborepo で drawdb-mcp と同一パターンを踏襲
- `apps/backend` (NestJS) + `apps/gui` (React + Vite)
- テスト用の `tests/e2e` ディレクトリはまだ作成しない（MVP 優先）

### TypeScript パスエイリアス
- `@/` パスエイリアス（tsconfig.json の paths 設定）は**使用しない**
- 理由: NestJS の `nest build`（tsc ベース）はビルド後の JavaScript に `@/` を残してしまい、実行時に解決できない。drawdb-mcp は webpack 経由でこれを解決しているが、webpack 設定を追加すると複雑さが増すため、相対パスを採用
- tsconfig.json の paths 設定は IDE の補完用として残すが、ソースコードでは相対パスを使用

### Backend 技術スタック
- NestJS 11 + @rekog/mcp-nest（drawdb-mcp と同一）
- WebSocket: @nestjs/platform-ws（ws ライブラリ）
- ロガー: Pino + pino-pretty
- バリデーション: Zod（MCP ツール定義に使用）
- ID 生成: nanoid

### GUI 技術スタック
- React 18 + Vite 6（drawdb-mcp と同一）
- スタイリング: Tailwind CSS 4
- **Semi UI / Dexie / Lexical / i18n / Monaco Editor は不採用** — MVP では不要と判断。drawdb は成熟した機能セットを持つが、本プロジェクトは TM モデリングに特化するため最小構成で開始
- ルーティング: なし（SPA 1画面構成、react-router-dom 不採用）

## WebSocket プロトコル

### コマンド形式
drawdb-mcp と同一パターンを採用：
- Backend → GUI: `{ id: string, command: string, params: object }`
- GUI → Backend: `{ id: string, success: boolean, data?: any, error?: string }`
- Heartbeat: GUI が `{ type: "ping" }` を送信、Backend が `{ type: "pong" }` を返す

### 接続管理
- 単一 GUI 接続のみ許可（drawdb-mcp と同一）
- 接続ロックで競合状態を防止
- GUI 側は指数バックオフで再接続（最大 10 回、最大遅延 30 秒）

## MCP ツール設計

### ツール命名規則
- プレフィックス `tm_` を付与（例: `tm_add_resource`, `tm_add_event`）
- drawdb-mcp はプレフィックスなし（`add_table`）だが、MCP ツールは名前空間がフラットなため他 MCP サーバーとの衝突を避ける

### `add_resource` と `add_event` の分離
- drawdb-mcp の `add_table` に相当するが、TM の R/E 区別を AI に明示させるため分離
- 内部的にはどちらも `addEntity` コマンドに変換される（`type` フィールドで区別）

### Entity の ID 管理
- Backend 側（MCP ツール内）で `nanoid()` を生成してから GUI に送る
- drawdb-mcp は「まず空テーブルを作成→ID が返る→そのテーブルを更新」の 2 段階だったが、本プロジェクトでは Entity を一発で作成する方式に簡素化

### validate_model の実装位置
- GUI 側の `DiagramContext.validateModel()` に検証ロジックを実装
- Backend の MCP ツールは GUI に `validateModel` コマンドを送って結果を受け取る
- 理由: GUI が state の source of truth であるため、一貫性のある検証が可能

## GUI 設計

### レイアウト
- 1 画面構成: Toolbar（上部）+ Canvas（中央）+ SidePanel（右側、選択時のみ表示）
- drawdb-mcp は Landing Page / Editor / Templates 等の複数ページ構成だが、MVP では Editor のみ

### Canvas
- SVG ベース（drawdb-mcp の SimpleCanvas パターンを踏襲）
- パン（背景ドラッグ）+ ズーム（マウスホイール）をサポート
- ドットパターン背景

### Entity の視覚表現
- foreignObject 内の HTML で描画（drawdb-mcp と同一手法）
- Resource: 角丸（borderRadius: 10px）、デフォルト青 (#3b82f6)
- Event: 角ばった形（borderRadius: 3px）、デフォルト赤 (#ef4444)
- ヘッダーに型バッジ表示: `[R]` または `[E]`
- subtype をタグとして表示（BASIC / RECURSIVE / CORRESPONDENCE）
- identifier 属性は ★ マークで表示

### Entity のサイズ
- 幅: 240px 固定
- 高さ: ヘッダー(36px) + subtype タグ(20px) + 属性行(24px × N) + パディング(8px)

### Reference の描画
- Entity 間の直線（曲線ではなく単純な直線を採用 — MVP 向け簡素化）
- カーディナリティラベル（1 / N）を両端に表示
- 矢印マーカーで方向を表示
- ラベルを中間点に表示

### Note
- 黄色の付箋スタイル（デフォルト色: #fbbf24）
- ドラッグ移動可能

### SidePanel
- 幅: 320px 固定
- Entity 選択時: 名前、type、subtype、色、コメント、属性一覧の編集 UI
- Note 選択時: 内容、色の編集 UI
- 削除ボタン付き

## auto_layout のロジック
- standard 戦略のみ初期実装
- Resource を上段（y=50）、Event を下段（y=400）に配置
- 各行は左から右に 280px 間隔で配置
- subtype でソート: basic → correspondence → recursive

## 省略した機能（MVP 後に追加検討）
- Undo / Redo
- ローカルストレージへの永続化（Dexie 等）
- エクスポート（SQL、DBML、画像）
- インポート（SQL、DBML）
- テンプレート
- 国際化（i18n）
- Docker デプロイ構成
- E2E テスト
- VEA マトリクスエクスポート（`export_vea_matrix` ツールは未実装、`validate_model` のみ実装）
