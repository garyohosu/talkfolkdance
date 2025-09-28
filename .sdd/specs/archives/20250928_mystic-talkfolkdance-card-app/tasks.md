# タスク分解 — 神秘のトークフォークダンスカードアプリ

- [x] テーマ・啓示データの雛形を整備し、`data/themes.js` と `data/revelations.js` を生成する（design.md: アーキテクチャ統合方法/主要コンポーネント）
- [x] `StorageService` を実装して `localStorage` の読込・保存・破損復旧ロジックを確立する（design.md: 主要コンポーネント/エラーハンドリング）
- [x] `DeckManager` を構築し、未使用テーマ抽選と残数管理のビジネスロジックを完成させる（design.md: 主要コンポーネント/データモデル）
- [x] `RevelationService` を実装し、啓示文ランダム選択とフォールバック処理を用意する（design.md: 主要コンポーネント/処理フロー）
- [x] `CardView` とアニメーション制御を作成し、裏返し表示とテキスト描画を制御する（design.md: 主要コンポーネント/処理フロー）
- [x] `ResetDialog` の UI と操作イベントを実装し、承認/拒否フローを制御する（design.md: 主要コンポーネント/処理フロー）
- [x] `index.html` と基礎スタイル (`styles/base.css`) を構築し、カードコンテナと操作要素を配置する（design.md: アーキテクチャ統合方法/既存コード統合）
- [x] カード演出とレスポンシブ調整を `styles/card.css` と `styles/responsive.css` に実装する（design.md: 処理フロー/エラーハンドリング）
- [x] `AppController` を作成してイベント配線、状態制御、サービス連携を統合する（design.md: 主要コンポーネント/処理フロー）
- [x] 手動動作確認チェックリストを作成し、主要ブラウザでのカード反転・リセット・ストレージ復旧を検証する（design.md: エラーハンドリング/非機能要件）
