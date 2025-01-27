<div align="center">
<h1>ZpDIC for Shaleian</h1>
</div>


## 概要
新シャレイア語辞典形式の閲覧と編集ができるアプリケーションです。
とりあえず必要最低限の機能は実装されていますが、一部の機能はメニューなどに項目があっても未実装です。
未実装の機能については、今後私自身が必要になり次第実装していく予定です。

新シャレイア語辞典形式を操作するコードは `renderer/module/dictionary` 以下にまとまっていて、その他の (主に GUI 部分に関する) コードからは完全に独立しています。
今後、この部分をこのリポジトリから分離して、独立した npm パッケージとして公開する予定です。

## ダウンロード
[こちら](https://github.com/Ziphil/ZpdicShaleian/actions/workflows/deploy.yml)にアクセスした後、リストの一番上を選択してください。
画面下部の「Artifacts」の欄から、お使いの環境に合わせたインストーラをダウンロードし、実行してください。

## ソースコードから実行
このリポジトリをクローンした後、リポジトリトップで以下のコマンドを実行すると、アプリケーションが起動してメインウィンドウが表示されます。
```
npm install
npm run build
npm start
```

このアプリケーションの開発を行いたい場合は、代わりに以下のコマンドを実行してください。
これを実行すると、ソースコードが監視された状態でアプリケーションが起動して、ソースコードを変更するとアプリケーションも自動的に再起動するようになります。
```
npm install
npm run develop
```