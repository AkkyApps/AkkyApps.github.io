# HANDOFF — akkyapps-lp

更新: 2026-08-13 | Codex

## Issue #1 リモートアプリ一覧

- `data/apps.json` に安定Kit ID、表示順、19言語の名称・短い説明を追加
- ja/en以外の17言語も各言語の名称・短い説明へ置換し、英語説明の流用が残っていないことを機械検証
- LPビルドで決定論的な `api/v1/apps.json` を生成
- ID/順序重複、19言語欠落、公開状態、App Store URLのHTTPS/許可ホストを検証
- `node scripts/build.mjs` と `node scripts/build.mjs --check` は成功
- `git diff --check` と19言語の欠落・英語説明流用チェックも成功

## 翻訳レビュー

- 19言語の構造・欠落検査は完了
- `localize-19` の基準上、tr / th / vi / id / hi は公開前のネイティブレビューを強く推奨

## 公開前の注意

- `main` pushは即時公開につながるため、ユーザーの公開確認前には行わない
- 公開後に実URLを取得し、アプリを再ビルドせず次回起動で更新されることをE2E確認する
