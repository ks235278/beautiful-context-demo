# Beautiful Context — 動作するプロトタイプ

**公開URL** → https://ks235278.github.io/beautiful-context-demo/

エディターで作ったコンテクストが、そのまま公開ページになり、UniverseIt! の
見出しに現れ、読めるようになります。画面をつないだだけのモックではなく、
データで動きます。

## 一周できること

```
起動画面
   ↓
UniverseIt!          公開中のコンテクストと作品の見出しが流れる
   ↓  見出しをタップ
コンテクストページ    二作品と、その間の文章
   ↓  ReMixIt!
エディター            左で編集、右にリアルタイム反映
   ↓  公開する
コンテクストページ    いま作ったページが開く
   ↓  UNIverseIt!
UniverseIt!          作ったページが見出しに増えている
```

## ファイル

| ファイル | 役割 |
|---|---|
| `docs/index.html` | 起動画面 |
| `docs/universe.html` | UniverseIt!。見出しはストアから生成。メニューから一覧・新規作成・初期化 |
| `docs/page.html` | 公開ページ。`?context=slug` と `?work=slug` で作品／コンテクストを描き分ける |
| `docs/editor.html` | エディター（前田先生の設計）。保存先を共有ストアに変更 |
| `docs/app.css` | 共通スタイル。`demo-1.html` の設計をそのまま継承 |
| `docs/js/store.js` | データ層。保存・更新・削除・slug 検索 |
| `docs/js/seed.js` | 初期データ2件 |
| `docs/reference/demo-1-original.html` | 前田先生の元モック（そのまま保存） |

## データの形

エディターが扱う `{a, b, context}` をそのまま1件として保持します。

```js
a / b   : { title, type, year, creator, slug, image, summary }
context : { routeName, label, headline, slug, relation,
            leftStation, rightStation, body }
```

作品は複数のコンテクストに登場できます。`store.works()` が出現箇所を集約するため、
作品ページには「その作品が関わるすべてのコンテクスト」への導線が並びます。

## エディターの使い方

| URL | 動作 |
|---|---|
| `editor.html` | サンプルを読み込む |
| `editor.html?new=1` | 空の状態から作る |
| `editor.html?slug=xxx` | 既存のコンテクストを編集する |

「公開する」で保存し、そのページへ移動します。路線名と作品A・Bの作品名は必須です。

## 保存先について

データはブラウザの `localStorage` に入ります。したがって —

- 作ったものは**その端末のそのブラウザにだけ**残ります
- 別の端末や別の人には見えません
- UniverseIt! のメニューから「初期データに戻す」でいつでもリセットできます

複数人で同じデータを見るにはサーバーとデータベースが必要です。本プロトタイプの
範囲外としています。

## 実装していないもの

- バックエンド、ログイン、共有データ
- 生成AIによる初稿生成
- 四軸評価エンジン（意外性・共感度・コンテンツ性・世界観近似性）
- 検索ボリューム・広告単価の照会
- ハブを主題とするランディングページ（現在は二作品1組が公開単位）

## 動かし方

`docs/index.html` をブラウザで開くだけで動きます。通信は不要です。

```bash
cd docs
python -m http.server 8788
```

## 画像の出典

作品画像は作品紹介を目的として引用の範囲で使用しています。
映画『HIGHEST 2 LOWEST』© A24 ／ 映画『天国と地獄』© 東宝
