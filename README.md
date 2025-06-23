# 借金返済くん - 返済計画シミュレーター

[![Deploy on GitHub Pages](https://img.shields.io/badge/Live%20Demo-nanaism.github.io-blueviolet?style=for-the-badge&logo=github)](https://nanaism.github.io/asset-management/)

**「いつになったら、この借金は終わるんだろう…」**
そんな不安を、具体的な「計画」と「希望」に変えるための、借金返済シミュレーションツールです。
借入総額、金利、毎月の返済額を入力するだけで、あなたの返済計画の全体像を瞬時に可視化します。

**👇 今すぐサイトでシミュレーション！**
### [https://nanaism.github.io/asset-management/](https://nanaism.github.io/asset-management/)

![借金返済くんのスクリーンショット](https://github.com/user-attachments/assets/7660de07-6fae-438f-b518-bbd84e126cd7)

---

## 🌟 プロジェクトの特徴 (Features)

このシミュレーターは、複雑な計算を意識させない、シンプルで直感的なユーザー体験を追求しました。

-   **📊 インタラクティブな返済グラフ**
    -   入力された情報をもとに、元金と利息がどのように減っていくかを**Recharts**で美しくグラフ化。返済の進捗が一目瞭然です。

-   **⏱️ 返済計画の即時サマリー**
    -   「完済までの期間」「支払う利息の総額」「返済総額」といった重要な数値を瞬時に算出し、明確に提示します。

-   **📋 詳細な返済スケジュール表**
    -   年ごと（または月ごと）の返済額、利息、元金の充当額、そして残高を詳細な表で確認でき、具体的な資金計画に役立ちます。

-   **✨ 洗練されたモダンなUI/UX**
    -   **shadcn/ui**と**Tailwind CSS**による、クリーンで使いやすいインターフェース。
    -   **Framer Motion**によるスムーズなアニメーションが、心地よい操作感を提供します。

-   **📱 レスポンシブデザイン**
    -   PCでもスマートフォンでも、デバイスを問わず最適なレイアウトで利用できます。

## 💡 こだわりのポイント： 「可視化」がもたらす力

借金というテーマは、精神的な負担が大きく、数字だけを眺めていると先の見えない不安に襲われがちです。
この「借金返済くん」が最も大切にしているのは、**返済への道のりを「可視化」する**ことです。

-   **モチベーションの維持**: 右肩下がりに減っていくグラフを見ることで、毎月の返済が着実にゴールに繋がっていることを実感でき、返済を続けるモチベーションになります。
-   **計画の具体化**: 「あと何年で終わるのか」「利息は総額でいくらになるのか」を具体的に知ることで、漠然とした不安を具体的な計画へと変えることができます。

親しみやすい「借金返済くん」という名前には、このツールがユーザーに寄り添い、共に返済計画を歩むパートナーのような存在でありたい、という願いを込めています。

## 🛠️ 使用技術 (Tech Stack)

このアプリケーションは、最新のフロントエンド技術スタックで構築されています。

-   **Core Framework**: **Next.js**, **React**, **TypeScript**
-   **UI Components**: **shadcn/ui**
-   **Styling**: **Tailwind CSS**
-   **Chart/Graph**: **Recharts**
-   **Animation**: **Framer Motion**
-   **Icons**: **Lucide React**
-   **Deployment**: GitHub Pages

## 🚀 ローカルでの実行方法 (Getting Started)

このプロジェクトをご自身の環境で動かす場合は、以下の手順に従ってください。

1.  **リポジトリをクローン**
    ```sh
    git clone https://github.com/nanaism/asset-management.git
    ```
2.  **ディレクトリに移動**
    ```sh
    cd asset-management
    ```
3.  **依存関係をインストール**
    ```sh
    npm install
    # または yarn install
    ```
4.  **開発サーバーを起動**
    ```sh
    npm run dev
    # または yarn dev
    ```
    ブラウザで `http://localhost:3000` を開いてください。
