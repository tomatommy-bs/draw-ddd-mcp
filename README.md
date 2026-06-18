<div align="center">
    <h1>draw-ddd-mcp</h1>
    <p>TM (T字型ER) モデリング + DDD アグリゲート可視化 MCP サーバー</p>
</div>

AI アシスタント (Claude) が Model Context Protocol (MCP) 経由で TM モデリング図を作成・編集・管理できるツール。WebSocket API によるリアルタイム連携。

**Architecture:**

- **apps/gui**: React + Vite ベースの TM モデリング GUI (SVG Canvas)
- **apps/backend**: NestJS MCP サーバー (AI アシスタントから GUI をプログラマティックに制御)
- Built with [Turborepo](https://turbo.build/repo) and [pnpm workspaces](https://pnpm.io/workspaces)

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8.15.0+ (install via `npm install -g pnpm`)

### Quick Start

**Start both GUI and backend:**

```bash
git clone https://github.com/tomatommy-bs/draw-ddd-mcp
cd draw-ddd-mcp
pnpm install
pnpm dev
```

Then:

1. **Open GUI**: http://localhost:5179
2. **Connect Claude Code** to the MCP server:

```bash
claude mcp add --transport http draw-ddd-mcp http://127.0.0.1:3009
```

Now Claude can create and modify TM diagrams for you!

### Individual Start

**Start GUI only:**

```bash
pnpm gui:dev
# Access at http://localhost:5179
```

**Start backend only (HTTP mode):**

```bash
pnpm backend:dev
# MCP server at http://localhost:3009
# WebSocket at ws://localhost:3009/remote-control
```

**Start backend only (STDIO mode):**

```bash
pnpm --filter backend start:dev:stdio
```

### Build

```bash
pnpm install
pnpm build
```

## Features

### TM Modeling Concepts

- **Resource (リソース)**: モノ・情報を表す青いエンティティ (上段配置)
- **Event (イベント)**: 出来事・行為を表す赤いエンティティ (下段配置)
- **Attribute**: エンティティの属性 (identifier フラグ・順序あり)
- **Reference**: エンティティ間の関連 (1:1, 1:N, N:1)

### Available MCP Tools

AI アシスタントが利用できる 21 の MCP ツール (すべて `tm_` プレフィックス):

**Entity Operations:**
- `tm_add_resource` - リソースエンティティを追加
- `tm_add_event` - イベントエンティティを追加
- `tm_update_entity` - エンティティのプロパティを更新
- `tm_delete_entity` - エンティティを削除
- `tm_get_entity` - エンティティの詳細を取得
- `tm_list_entities` - エンティティ一覧を取得

**Attribute Operations:**
- `tm_add_attribute` - エンティティに属性を追加
- `tm_update_attribute` - 属性を更新
- `tm_delete_attribute` - 属性を削除
- `tm_set_identifier` - 属性を識別子として設定

**Reference Operations:**
- `tm_add_reference` - エンティティ間の関連を作成
- `tm_update_reference` - 関連を更新
- `tm_delete_reference` - 関連を削除

**Note Operations:**
- `tm_add_note` - 注釈を追加
- `tm_update_note` - 注釈を更新
- `tm_delete_note` - 注釈を削除

**Diagram Operations:**
- `tm_get_diagram` - ダイアグラム全体の状態を取得
- `tm_import_diagram` - ダイアグラムをインポート
- `tm_export_diagram` - ダイアグラムをエクスポート
- `tm_validate_model` - TM モデルのルールを検証
- `tm_auto_layout` - エンティティを自動配置

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3009` | Backend server port |
| `HOST` | `127.0.0.1` | Backend server host |
| `LOG_LEVEL` | `info` | Backend log level |
| `VITE_REMOTE_CONTROL_ENABLED` | `false` | Enable GUI WebSocket connection |
| `VITE_REMOTE_CONTROL_WS` | (auto-detect) | WebSocket URL override |

## How It Works

```
Claude (Claude Code / Claude Desktop)
    |
    v
MCP Server (NestJS backend, port 3009)
    |  - Receives MCP tool calls (e.g., tm_add_resource)
    |  - Routes to TMClientService
    v
WebSocket (/remote-control)
    |  - Bidirectional JSON protocol
    |  - Request: { id, command, params }
    |  - Response: { id, success, data, error }
    v
GUI (React app, port 5179)
    |  - useRemoteControl hook receives commands
    |  - DiagramContext executes state changes
    |  - SVG Canvas re-renders in real-time
```

See [CLAUDE.md](./CLAUDE.md) for detailed architecture documentation.
