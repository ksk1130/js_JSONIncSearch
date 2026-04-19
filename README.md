# kenall.json インクリメンタルサーチ

`kenall.json` を読み込んで、郵便番号や住所をリアルタイム検索するシンプルなVanilla JSアプリです。

## 特徴

- オフラインで使える（外部ライブラリなし）
- 入力に応じて即時絞り込み（インクリメンタルサーチ）
- 郵便番号・漢字住所・カナ住所を対象に部分一致検索
- 自動読込失敗時はファイル選択で手動読込可能

## ファイル構成

- `index.html`: 画面
- `style.css`: スタイル
- `app.js`: 読込・検索ロジック
- `kenall.json`: 住所データ

## 使い方

### 1. ローカルサーバーを起動

ブラウザの制限で `file://` 直開きでは `fetch` が失敗するため、ローカルサーバー経由を推奨します。

```powershell
cd c:\Users\kskan\Desktop\js_JSONIncSearch
.\exec.bat
```

### 2. ブラウザで開く

- `http://127.0.0.1:8000` を開く

## 補足

- もし自動読込に失敗した場合は、画面内の「自動読込に失敗した場合」を開き、`kenall.json` を手動選択してください。
- 表示件数はUI右側のセレクトで変更できます。

## Java 21で最小JREを作って配信する

Java EEなしで、`jlink`を使って`jwebserver`専用の最小JREを作成できます。

### 1. 最小JREを生成

```powershell
cd c:\Users\kskan\Desktop\js_JSONIncSearch
.\New-MinimalJwebserverRuntime.bat "C:\bin\jdk-21" ".runtime\jwebserver-jre"
```

### 2. 生成したJREでサーバー起動

```powershell
cd c:\Users\kskan\Desktop\js_JSONIncSearch
.\exec.bat
```

```powershell
cd c:\Users\kskan\Desktop\js_JSONIncSearch
$dir = (Get-Location).Path
.\.runtime\jwebserver-jre\bin\jwebserver --port 8000 --directory "$dir"
```

### 3. ブラウザで確認

- `http://127.0.0.1:8000`
