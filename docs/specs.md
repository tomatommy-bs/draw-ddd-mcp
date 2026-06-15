# 決定事項

## プロジェクト概要

- プロジェクト名: draw-ddd-mcp
- 目的: TM モデリング手法を GUI 上で AI と対話しながら実行し、そのモデルをもとに DDD の集約を定義する MCP サーバー

## 2段階アプローチ

- Phase 1: TM モデリングを GUI 上で AI と対話して要件をモデリングする
- Phase 2: TM モデルをもとに DDD 集約を定義する

## アーキテクチャ

- drawdb-mcp をお手本とする monorepo 構成（pnpm workspaces + Turborepo）
- apps/backend: NestJS MCP サーバー（@rekog/mcp-nest）
- apps/gui: React フロントエンド
- Backend → WebSocket → GUI のリアルタイム連携パターンを踏襲

## TM モデリングの基本方針

- Resource (R) と Event (E) の二大分類を第一級オブジェクトとして扱う
- 個体指定子（identifier）の概念をデータモデルに組み込む
- drawdb の Table を R/E に、Field を Attribute に、Relationship を Reference に読み替える

## MCP ツール設計

- `add_resource` と `add_event` はツールレベルで分離する（`add_entity` に統合しない）
- Attribute は独立エンティティとして管理する（`attributeId` で直接操作可能）
- TM 固有ツール: `set_identifier`, `validate_model`, `export_vea_matrix`, `auto_layout`
- drawdb の Enum / Type / set_database は不要（TM は DB 非依存の論理モデリング）
- Phase 1 は 22 ツール、Phase 2 で +10 ツール追加

## エンティティの色分け

- Resource のデフォルト色: 青系 (#2563eb)
- Event のデフォルト色: 赤系 (#dc2626)

## Canvas 配置慣例

- Resource を上段、Event を下段に配置する TM の慣例を `auto_layout` で実装
