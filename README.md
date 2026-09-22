# Beautiful Context — 画面遷移デモ

`flow0921` の構成図に沿って、4つの画面を一続きに操作できるようにしたプロトタイプです。

**公開URL** → https://ks235278.github.io/beautiful-context-demo/

## 画面構成

```
起動画面  →  UniverseIt!  →  作品・コンテクストページ  →  エディター
index.html   universe.html   demo-1.html                editor.html
```

| ファイル | 内容 | 状態 |
|---|---|---|
| `docs/index.html` | 起動画面。タップで UniverseIt! へ | 新規 |
| `docs/universe.html` | 見出し約100点がタグクラウド状に流れ続ける回遊画面（チャコール） | 新規 |
| `docs/demo-1.html` | 作品ページ A・B とコンテクストページ A–B | 既存＋導線を追加 |
| `docs/editor.html` | カード型エディター。左で編集し右にリアルタイム反映 | 既存＋導線を追加 |

## 画面のつながり

- 起動画面をタップ → `universe.html`
- 見出しをタップ → `demo-1.html`
- `ReMixIt!` → `editor.html`
- `UNIverseIt!` → `universe.html`
- エディターの「← 公開ページへ」 → `demo-1.html`

## UniverseIt! について

- 見出しは約100点。行ごとに速度と向きを変えてゆっくり流れ続けます
- 指を置く（マウスを乗せる）と停止します
- 下部の `UniverseIt!` ボタンで見出しを入れ替えます
- 背景はチャコール。基本要素は白背景版と共通です

## 含まれないもの

本デモは画面遷移の確認用です。以下は実装していません。

- バックエンド、データベース、ログイン
- 生成AIによる初稿生成
- 四軸評価エンジン
- 検索ボリューム・広告単価の照会

## 動かし方

`docs/index.html` をブラウザで開くだけで動きます。通信は不要です。

ローカルサーバーで確認する場合:

```bash
cd docs
python -m http.server 8788
```

## 画像の出典

`demo-1.html` 内の作品画像は、作品の紹介を目的として引用の範囲で使用しています。
映画『HIGHEST 2 LOWEST』© A24 ／ 映画『天国と地獄』© 東宝
