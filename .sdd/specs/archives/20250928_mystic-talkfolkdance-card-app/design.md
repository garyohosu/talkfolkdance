# 設計 — 神秘のトークフォークダンスカードアプリ

## アーキテクチャ統合方法
- 静的フロントエンド構成（`index.html` + `styles/` + `scripts/`）で提供し、ビルドやサーバーサイド処理を必要としない。
- 主要ロジックは ES モジュールとして分割し、ブラウザが直接読み込む形を想定する（バンドラー不要）。
- UI は 1 ページ構成。カードコンテナ、テーマ表示、啓示表示、リセットボタンなどをセクション化し、CSS でタロット風デザインとアニメーションを適用する。
- テーマデータは JSON ファイルまたは JS モジュールとして静的に同梱し、初期ロード時に読み込む。1000 件規模でもオフラインで扱えるようクライアント側で完結させる。
- ブラウザストレージ（`localStorage`）を永続化レイヤーとし、使用済みテーマ ID とリビルド情報を保持する。

## 主要コンポーネント
- **AppController (`scripts/app.js`)**
  - 起動処理、イベントバインド、コンポーネント間の調整を担当。
  - 入力: DOMContentLoaded イベント、ユーザー操作（タップ、リセット）
  - 出力: UI 更新のトリガー、Deck/Storage への操作指示
  - 依存: `DeckManager`, `RevelationService`, `StorageService`, `CardView`
- **DeckManager (`scripts/deck-manager.js`)**
  - テーマ集合を管理し、未使用テーマからランダムに 1 件を提供。
  - 入力: テーマ配列、使用済みテーマセット
  - 出力: 次に表示するテーマ、残数情報
  - 依存: `StorageService`
- **RevelationService (`scripts/revelation-service.js`)**
  - 啓示文のリストを保持し、リクエストごとにランダム選択して返す。
  - 入力: 啓示メッセージ配列
  - 出力: 選択された啓示文字列
- **StorageService (`scripts/storage-service.js`)**
  - `localStorage` とのやりとりを抽象化。読み込み、保存、破損検知、クリアを提供。
  - 入力: 使用済みテーマ ID の配列、ストレージキー
  - 出力: 保存操作結果、復旧時の初期化通知
- **CardView (`scripts/card-view.js`)**
  - DOM レイヤーを制御。カード裏面/表面切り替えアニメーションとテキスト描画を担う。
  - 入力: テーマ文字列、啓示文字列、アニメーション状態
  - 出力: アニメーション実行、UI 状態更新
- **ResetDialog (`scripts/reset-dialog.js`)**
  - リセット確認の UI 表現（モーダル/ブラウザ確認ダイアログ）を統一的に管理。
  - 入力: 残テーマ数、利用者アクション
  - 出力: 承認/拒否結果を `AppController` に返す
- **Data Modules (`data/themes.js`, `data/revelations.js`)**
  - テーマと啓示メッセージの静的配列を提供。読みやすさのため複数ファイルに分割する可能性あり。

## データモデル
- `Theme` オブジェクト: `{ id: string, text: string }`
  - `id` はユニークな文字列または数値（例: `theme-001`）。
  - `text` は表示するテーマ内容。
- `Revelation` は単純文字列の配列として管理。
- `UsedThemeState`（ストレージ保存形式）: `{ version: number, usedIds: string[] }`
  - `version` によりデータ構造変更時のマイグレーションを判定。
  - `usedIds` は過去に提示済みの `Theme.id` リスト。
- ストレージキー（暫定）: `talkfolkdance.usedThemes`
- 内部状態:
  - `availableThemeIds: string[]`
  - `remainingCount: number`
  - `isAnimating: boolean`

## 処理フロー
1. **初期化**
   1. `AppController` が DOM を取得し、`StorageService` から使用済みテーマ状態をロード。
   2. ストレージが壊れている場合は復旧（`usedIds` を空配列）してユーザーにトースト/アラート表示。
   3. `DeckManager` がテーマリストと使用済み ID を受け取り、残テーマ数を計算。
   4. イベントハンドラを登録（カードタップ、リセットボタン、画面回転など）。
2. **カード反転アクション**
   1. `AppController` がカード操作を受け付け、アニメーション中は二重受付を防ぐ。
   2. `DeckManager` から次テーマを取得。残テーマゼロの場合はリセットフローへ遷移。
   3. `RevelationService` から啓示文を取得。
   4. `CardView` が裏返しアニメーションを実行し、完了後にテーマと啓示を描画。
   5. 使用テーマ ID を `StorageService` に保存し、DeckManager の内部状態を更新。
3. **リセットフロー**
   1. 全テーマ消費、またはユーザーが明示的にリセットボタンを押下した場合に `ResetDialog` を表示。
   2. 承認時: `StorageService` がデータをクリア。`DeckManager` が初期状態に戻る。`CardView` は裏面表示へリセット。
   3. 拒否時: 現在の表面表示を維持し、DeckManager の状態はそのまま。
4. **画面サイズ変更**
   1. `AppController` が `resize` イベントを受け取り、CSS カスタムプロパティやクラスを更新してレイアウトの破綻を防ぐ。

## エラーハンドリング
- `localStorage` 非対応・容量不足
  - 初回ロード時に例外が発生したら、代替としてメモリ上に状態を保持し、ユーザーへ永続化できない旨を通知。
- JSON 解析エラー / スキーマ不一致
  - `StorageService` で try-catch を行い、復旧処理（データ初期化）と警告表示を行う。
- テーマデータ欠落
  - ロード時にテーマ配列が 0 件なら、UI 上にエラーメッセージを出し、カード操作を無効化。
- アニメーション失敗（CSS 未適用など）
  - アニメーションイベントが発火しない場合に備え、タイムアウトで UI を確定状態に遷移させるフォールバックを持つ。
- 画面回転時のレイアウト崩れ
  - CSS メディアクエリと JavaScript の両方で保険をかけ、極端なアスペクト比でも文字が読みづらくならないようフォントサイズを再計算。

## 既存コード統合（変更 / 新規ファイル）
- 既存アプリコードは存在しないため、新規作成ファイルとして以下を想定:
  - `index.html`: ルート HTML。カード UI のマークアップとモバイル対応メタタグを定義。
  - `styles/base.css`, `styles/card.css`, `styles/responsive.css`: 基本スタイル、カードアニメーション、レスポンシブ調整。
  - `scripts/app.js`: 初期化とイベント配線。
  - `scripts/deck-manager.js`, `scripts/storage-service.js`, `scripts/revelation-service.js`, `scripts/card-view.js`, `scripts/reset-dialog.js`: 各ロジックモジュール。
  - `data/themes.js`, `data/revelations.js`: テーマと啓示文のデータセット。
- 静的アセット（カード背景画像、フォント）は `assets/` 配下に配置し、CSS から参照する。
- GitHub Pages 配備を想定し、ルート直下に配置したファイル群だけで動作可能な構成とする。
