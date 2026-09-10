# akkyapps-lp

AkkyApps の LP(GitHub Pages: https://akkyapps.github.io/)。

> ⚠️ **main への push = 即公開**。push 前に必ず生成結果をローカル確認し、ユーザー承諾を得ること。

## 構成

```
data/apps.json               # アプリ情報 + News(ここだけ編集すれば良い)
templates/index.template.html # ページ骨格(CSS・ヒーロー・フッター等)
scripts/build.mjs            # JSON + テンプレート → index.html 生成(依存ゼロ)
index.html                   # 生成物。直接編集しない
divisionmaster4/ 等          # アプリ説明書サブページ(ビルド対象外・手動管理)
downloads/                   # 配布物(Purge zip 等)
icons/                       # アプリアイコン PNG
```

## 更新手順

1. `data/apps.json` を編集
   - トップの主役は `featured[]` の順序・見出し・説明で管理。現在はPrompter、PictOrb、Pantry。アイコンとリンクは `apps[]` を共用し、通常一覧との重複を除外する
   - アプリ追加/更新: `apps[]`(`section`: apps / kids / tools、`icon.type`: pair / single / silhouette / emoji)
   - リリース告知: 日本向けApp Storeの「バージョン履歴」と同じ内容を `news[]` に `{date, appId, version, title, body, url}` で保持
   - App Store側に説明がない初回版だけ、本文を `初回リリース` とする
   - Newsは日付降順で最新12件を表示し、それ以前は「過去の更新履歴」内へ折りたたむ（`news` が空ならセクション自体を非表示）
2. ビルド: `node scripts/build.mjs`
3. ローカル確認: `python3 -m http.server 8000` → http://localhost:8000
4. `git diff index.html` をレビューしてコミット → **ユーザー確認の上で** push

`node scripts/build.mjs --check` で index.html が最新か検証できる(コミット前チェック用)。

## アプリ内リンクの配信

`api/v1/apps.json` がAkkyAppsKit向け公開カタログの正本。LP用の `data/apps.json` とはschemaが異なるため、そのまま流用しない。

- 公開済みアプリを追加するときは、安定ID・App Store URL・重複しないorder・19localeのname/descriptionを登録し、generatedAtを更新する。
- `node scripts/check-app-catalog.mjs` と `node scripts/build.mjs --check` を実行する。公開済みLPアプリの掲載漏れも検出する。
- 公開後は `https://akkyapps.github.io/api/v1/apps.json` のHTTP 200・配信本文一致を確認する。
- 対応済みKitのリンク欄は起動ごと初回表示時に1回取得する。取得失敗時は検証済みキャッシュ／同梱一覧を維持する。即時push通知ではない。
- 初回一覧は既存Kitの8アプリ翻訳を再利用し、公開確認済みPictOrb/PAlarmを追加した。新規説明文の母語レビューは未実施。

## 2026-09-10 LP導線見直し

- トップを日本語の用途紹介へ変更し、Prompter/PictOrbを主役、Pantryをその直下に配置。既存のライト/ダークアイコンと角丸を維持。日本語はNoto Sans JP＋日本語システム書体、本文16px・行高1.75を基準とする。
- PAlarmはApple公開Lookup（`https://itunes.apple.com/lookup?id=6800244742&country=jp`）でtrackId一致、1.0.2、無料、公開日時 `2026-09-01T18:56:30Z` を確認。Coming Soonを解消し、公式releaseNotesをNewsへ反映。無料終了日や将来価格はこの応答から確定できないため掲載しない。
- ローカル検証：生成整合、10アプリ・19ロケールのカタログ整合、375px/1280pxのブラウザ表示、画像読み込み、10カード掲載を確認。Prompter英語製品ページ・各アプリ内向けAPIは変更しない。
