# 未決定事項

## データモデル

- [ ] TMEntity の subtype 分類（basic / recursive / correspondence）は十分か。原典との差異を検証する必要あり
- [ ] 「在庫」のような状態系エンティティの分類基準（Event か対照 Resource か）
- [ ] 「みなし entity」「aP/rP の厳密な区別」「HDR-DTL 構造」の原典準拠レベル
- [ ] Attribute を Entity に内包するか、完全に独立したコレクションとするか（現案は独立）

## GUI インタラクション

- [ ] ユーザーが GUI 上で直接操作する範囲（Canvas でドラッグ配置？ 主に AI が描画してレビュー中心？）
- [ ] GUI フレームワーク選定（drawdb は React 18 + Vite だが、そのまま踏襲するか）
- [ ] Canvas 描画ライブラリの選定
- [ ] R/E の視覚的区別方法（色のみ？ 形状も変える？ アイコン？）

## Phase 2: TM → DDD マッピング

- [ ] Event をどの Aggregate に入れるかの判断ルール（ヒューリスティクスの定義）
- [ ] suggest_aggregates の推定ロジック
- [ ] Aggregate / BoundedContext の GUI 表現（Area の流用？ 独自描画？）
- [ ] Phase 1 と Phase 2 を同一 Canvas で表示するか、別ビューにするか

## TM 手法の厳密さ

- [ ] 佐藤正美の原典にどこまで忠実に従うか（ライト版 vs 厳密版）
- [ ] VEA マトリクスの検証項目の網羅性
- [ ] 正規化レベルの検証をどこまで自動化するか

## インフラ・運用

- [ ] Docker デプロイの要否
- [ ] CI/CD パイプライン
- [ ] テスト戦略（drawdb-mcp は e2e のみ。同じ方針か？）
