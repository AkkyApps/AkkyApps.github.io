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
   - アプリ追加/更新: `apps[]`(`section`: apps / kids / tools、`icon.type`: pair / single / silhouette / emoji)
   - リリース告知: `news[]` の先頭に `{date, appId, version, title, body, url}` を追加(日付降順で表示、`news` が空なら News セクション自体が非表示)
2. ビルド: `node scripts/build.mjs`
3. ローカル確認: `python3 -m http.server 8000` → http://localhost:8000
4. `git diff index.html` をレビューしてコミット → **ユーザー確認の上で** push

`node scripts/build.mjs --check` で index.html が最新か検証できる(コミット前チェック用)。
