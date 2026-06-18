# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TM (T字型ER) モデリング手法を可視化する MCP サーバー + GUI。DDD のアグリゲート定義を支援する。
drawdb-mcp のパターンを踏襲した pnpm + Turborepo モノレポ構成。

## Commands

```bash
# 開発 (backend + gui 同時起動)
pnpm dev

# 個別起動
pnpm gui:dev          # GUI (Vite, port 5179)
pnpm backend:dev      # Backend HTTP mode (NestJS, port 3009)

# ビルド・品質
pnpm build
pnpm --filter backend lint
pnpm --filter backend type-check
pnpm format           # Prettier (全体)
```

Backend には stdio モードもある: `pnpm --filter backend start:dev:stdio`

## Architecture

```
apps/backend/   NestJS 11 MCP サーバー (@rekog/mcp-nest)
apps/gui/       React 18 + Vite 6 + Tailwind CSS 4 (最小構成、ルーティングなし)
docs/           仕様書 (specs.md: 設計決定, ai-specs.md: 技術判断)
```

### Backend

- **エントリポイント**: `main-http.ts` (HTTP + WebSocket) / `main-stdio.ts` (stdio)
- **ドメインロジック**: `src/tm/` — `tm-client.service.ts` が GUI との WebSocket 通信を管理。単一接続を強制。
- **MCP ツール**: `src/mcp/primitives/tm/tools/` — 21 ツール、すべて `tm_` プレフィックス。各ツールは NestJS Injectable + `@Tool()` デコレータ。Zod でパラメータ検証。
- **WebSocket プロトコル**: `{ id, command, params }` → `{ id, success, data, error }` (30 秒タイムアウト)
- パスエイリアス `@/*` は IDE 用のみ。**コード内では相対パスを使用すること** (nest build の制約)。

### GUI

- **状態管理**: `DiagramContext.jsx` — Redux/Zustand なし、React Context のみ。バリデーションロジックもここ。
- **Canvas**: SVG ベース。パン (ドラッグ) + ズーム (ホイール、0.2x–3x)。ドットパターン背景。
- **WebSocket**: `useRemoteControl.js` — `VITE_REMOTE_CONTROL_ENABLED=true` で有効化。指数バックオフ付き自動再接続。
- **レイアウト**: リソースは上 (y=50)、イベントは下 (y=400)、280px 間隔。

### TM モデリングの概念

- **リソース (Resource)**: 青 `#2563eb`、上段配置。モノ・情報。
- **イベント (Event)**: 赤 `#dc2626`、下段配置。出来事・行為。
- **サブタイプ**: basic / recursive / correspondence
- **Attribute**: エンティティの属性。identifier フラグと順序あり。
- **Reference**: エンティティ間の関連 (1:1, 1:N, N:1)。

## Environment Variables

Backend: `PORT` (3009), `HOST` (127.0.0.1), `LOG_LEVEL` (info)
GUI: `VITE_REMOTE_CONTROL_ENABLED` (false), `VITE_REMOTE_CONTROL_WS` (optional override)

## Code Style

- Prettier: single quotes, trailing commas, 100 char width, semicolons
- ESLint: TypeScript recommended + Prettier 統合 (backend)
- テストは未導入 (MVP)
