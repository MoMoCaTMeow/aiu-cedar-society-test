# **momo1105.com における次世代フロントエンドアーキテクチャの構築：Astro 5.0、Content Layer API、およびモダンWeb標準技術の包括的実装戦略**

## **1\. エグゼクティブサマリーと戦略的展望**

2025年のWeb開発ランドスケープは、かつてないほどの変革期を迎えています。長らく支配的であった「JavaScriptによるすべて」の制御（SPA: Single Page Application）から、サーバーサイドとブラウザのネイティブ機能を最大限に活用する「ハイブリッド」かつ「HTMLファースト」なアプローチへの回帰と進化が進んでいます。現在、momo1105.com は **Astro** フレームワークとヘッドレスCMSである **microCMS** を採用しており、この技術選定は現代のパフォーマンス基準において極めて優位な立ち位置にあります。しかし、Astroエコシステムの急速な進化、特に **Astro 5.0** でのアーキテクチャ刷新や、ブラウザ標準機能（CSS Container Queries、Scroll-driven Animations、View Transitions API）の成熟により、さらなるパフォーマンスの最適化と開発者体験（DX）の向上が可能となっています。

本レポートは、momo1105.com の既存スタックを前提としつつ、2025年時点での最新技術を導入するための詳細なリサーチ結果と実装ロードマップを提示するものです。特に、サイトパフォーマンス（Core Web Vitals）、バンドルサイズ、ビルド効率への影響を定量・定性の両面から分析し、単なる機能追加に留まらない、持続可能なアーキテクチャの提案を行います。

分析の結果、以下の3つの主要な技術的柱が特定されました：

1. データアーキテクチャの刷新（Content Layer API）:  
   従来の fetch ベースや astro:content（レガシー）から、Astro 5.0の Content Layer API への移行。これにより、microCMSからのデータ取得における型安全性の確立、ビルド時間の劇的な短縮、およびメモリリークの防止を実現します1。  
2. レンダリング戦略の最適化（Server Islands）:  
   静的サイト生成（SSG）の利点を維持しつつ、動的コンテンツ（人気記事ランキングやリアルタイムステータスなど）を遅延読み込みさせる Server Islands の導入。これにより、クライアントサイドJavaScript（React/Vue）によるハイドレーションコストをゼロにし、Interaction to Next Paint (INP) を改善します3。  
3. UXとパフォーマンスの融合（ClientRouter & Modern CSS）:  
   SPAのようなシームレスな画面遷移を実現する ClientRouter（旧View Transitions）と、JavaScriptランタイムを排除した CSS Container Queries および Scroll-driven Animations の採用。これにより、メインスレッドのブロッキングを回避し、LCP（Largest Contentful Paint）とCLS（Cumulative Layout Shift）を最適化します5。

本稿では、これらの技術がいかにして momo1105.com のユーザー体験を向上させ、同時に運用コスト（サーバーリソースやビルド時間）を削減するかについて、詳細に論じます。

## ---

**2\. Astro 5.0 Content Layer API によるデータパイプラインの再構築**

momo1105.com のようなコンテンツ駆動型サイトにおいて、CMSからのデータ取得プロセスはビルドパフォーマンスと開発効率の生命線です。Astro 5.0で正式導入された **Content Layer API** は、外部データソース（microCMS）の扱いを根本から変革する強力な機能です。

### **2.1 従来のデータ取得における課題と限界**

Astro v4以前、またはレガシーな実装パターンにおいて、microCMSとの連携は主に以下の2つの方法で行われていました。

第一に、.astro コンポーネント内での直接的な fetch 実行です。これは直感的ですが、ページ数が増加するにつれてAPIコール数が線形に増加し、ビルド時間が肥大化するという重大な欠点がありました。また、各ページで個別にデータ取得を行うため、同一データへの重複リクエストが発生しやすく、APIのレート制限に抵触するリスクも高まります。

第二に、Astro v2で導入された「Content Collections」ですが、これは元来Markdown/MDXなどのローカルファイルを対象として設計されていました。そのため、microCMSのようなリモートソースを扱う場合、一度ローカルにJSONとして書き出す独自スクリプトを組むか、型定義を手動で同期させる必要があり、保守コストが増大する傾向にありました。

### **2.2 Content Layer API のアーキテクチャと優位性**

Astro 5.0のContent Layer APIは、これらの課題を解決するために設計された「ローダー（Loader）」ベースのアーキテクチャです1。この仕組みでは、データ取得ロジックがレンダリングプロセスから分離され、ビルドの初期段階で一括して実行されます。

#### **2.2.1 データストアの仕組みと型安全性**

Content Layerは、取得したデータをメモリ上の最適化されたデータストア（Data Store）に格納します。このストアは、サイト内のあらゆるコンポーネントからクエリ可能であり、Zodスキーマによる厳格なバリデーションを経て格納されます。

momo1105.com における具体的なメリットは以下の通りです：

| 機能 | 従来の実装 (Legacy) | Content Layer (Astro 5.0) |
| :---- | :---- | :---- |
| **データ取得のタイミング** | 各ページ生成時 (Page-level) | ビルド初期の一括実行 (Global-level) |
| **型安全性 (TypeScript)** | 手動定義 (interface作成が必要) | Zodスキーマからの自動生成 |
| **ビルドパフォーマンス** | ページ数に比例して悪化 O(N) | データ量に依存 (効率的) O(1) |
| **キャッシュ戦略** | 実装依存 (困難) | インクリメンタルビルド対応可能 |

#### **2.2.2 microcms-astro-loader の導入とカスタマイズ**

実装にあたっては、コミュニティ製の microcms-astro-loader を利用するか、要件が複雑な場合は独自のローダーを定義することが推奨されます9。特に、microCMSのAPIはリッチエディタのHTML構造や画像オブジェクトを含んでおり、これらをZodで正確に定義することで、予期せぬビルドエラーを防ぐことができます。

以下は、momo1105.com に最適化された src/content.config.ts の構成案です。

TypeScript

// src/content.config.ts  
import { defineCollection, z } from "astro:content";  
import { microCMSContentLoader } from "microcms-astro-loader";

// ブログ記事コレクションの定義  
const blogCollection \= defineCollection({  
  // ローダー定義：APIキー等は環境変数から安全に注入  
  loader: microCMSContentLoader({  
    serviceDomain: import.meta.env.MICROCMS\_SERVICE\_DOMAIN,  
    apiKey: import.meta.env.MICROCMS\_API\_KEY,  
    endpoint: "blog",  
    // 取得フィールドを絞り込むことでペイロードサイズを削減  
    queries: {  
      fields: \["id", "title", "publishedAt", "eyecatch", "category", "content"\],  
      limit: 100,  
    },  
  }),  
  // スキーマ定義：データの整合性を保証  
  schema: z.object({  
    id: z.string(),  
    title: z.string(),  
    publishedAt: z.coerce.date(),  
    content: z.string(),  
    // 画像オブジェクトの構造定義（Astro Assetsとの連携に重要）  
    eyecatch: z.object({  
      url: z.string().url(),  
      height: z.number(),  
      width: z.number(),  
    }).optional(),  
    category: z.array(z.string()).optional(),  
  }),  
});

export const collections \= {  
  blog: blogCollection,  
};

この構成により、開発者はコンポーネント内で await getCollection('blog') を呼び出すだけで、型安全なデータ配列を取得できます。microcms-astro-loader は内部的にページネーション処理を隠蔽し、全件取得を効率的に行うため、開発者が再帰的なAPIコールを記述する必要はありません9。

### **2.3 インクリメンタルビルドとパフォーマンスへの影響**

Content Layerの真価は、大規模サイトにおけるビルド時間の短縮にあります。ローダーはデータのダイジェスト（ハッシュ値）を生成し、前回のビルドから変更がないデータについては再処理をスキップする機能を持っています8。microCMS側の更新日時（revisedAt）をキーとしてキャッシュ戦略を組むことで、記事数が数千件に達した場合でも、変更があった記事のみを再ビルド対象とすることが理論上可能です。

また、メモリ管理の観点からも改善が見込まれます。過去のAstroバージョンでは、大量のMarkdownファイルを処理する際にNode.jsのヒープメモリ枯渇（Heap Out Of Memory）が発生する事例が報告されていました10。Astro 5.0のContent Layerは、データを効率的にシリアライズし、必要に応じてディスクキャッシュを活用する設計となっているため、大規模なデータセットに対しても安定したビルドプロセスを提供します。これは、将来的に momo1105.com のコンテンツ量が増加した際の安定稼働を保証する重要な要素です。

## ---

**3\. Server Islands: 動的コンテンツのハイブリッドレンダリング戦略**

Webサイトにおける「静的」と「動的」の境界線は、Astro 5.0の **Server Islands** によって再定義されました。これまで、ユーザーごとのパーソナライズ表示やリアルタイム情報の表示には、ページ全体をSSR（Server-Side Rendering）にするか、クライアントサイドでのJavaScriptフェッチ（Reactの useEffect 等）が必要でした。しかし、これらはTTFB（Time To First Byte）の遅延や、レイアウトシフト（CLS）の原因となっていました。

### **3.1 Server Islands の技術的メカニズム**

Server Islandsは、ページ内の特定のコンポーネントだけをサーバー上で遅延レンダリングし、残りの部分を静的なHTMLとして即座に配信する技術です3。

1. **静的シェルの配信**: ユーザーがアクセスした瞬間、サーバー（CDN）は大部分の静的なHTML（ヘッダー、フッター、記事本文など）を返します。これにより、LCP（Largest Contentful Paint）が高速化されます。  
2. **プレースホルダーの表示**: 動的コンポーネントが配置される場所には、slot="fallback" で定義されたローディングUI（スケルトンなど）が表示されます。  
3. **非同期フラグメント注入**: ブラウザはバックグラウンドで動的コンポーネント専用のAPIエンドポイントへリクエストを投げます。サーバー側で処理が完了すると、HTMLフラグメントが返され、自動的にプレースホルダーと置換されます。

このプロセスにおいて、クライアントサイドに巨大なJavaScriptバンドル（ReactやVueのランタイム）を送信する必要は一切ありません。すべてはAstroの軽量なスクリプトによって制御されます。

### **3.2 momo1105.com への導入シナリオ**

momo1105.com において、microCMSと連携した以下のような機能にServer Islandsが適用可能です。

#### **3.2.1 人気記事ランキング（リアルタイム集計）**

Google AnalyticsやmicroCMSのAPIを利用して「現在読まれている記事」を表示する場合、これをビルド時に固定するとデータが陳腐化します。Server Islandsを使えば、常に最新のランキングを表示できます。

コード スニペット

\---  
// components/PopularPosts.astro  
// サーバーサイドでのみ実行される処理  
const response \= await fetch("https://api.analytics.service/ranking");  
const ranking \= await response.json();  
\---  
\<div class="ranking-list"\>  
  {ranking.map(post \=\> \<a href={post.url}\>{post.title}\</a\>)}  
\</div\>

**ページへの埋め込み:**

コード スニペット

\---  
import PopularPosts from "../components/PopularPosts.astro";  
import Skeleton from "../components/Skeleton.astro";  
\---  
\<aside\>  
  \<h3\>Popular Now\</h3\>  
  \<PopularPosts server:defer\>  
    \<Skeleton slot="fallback" height="200px" /\>  
  \</PopularPosts\>  
\</aside\>

#### **3.2.2 プレビューモードの実装強化**

microCMSの下書きプレビュー機能においても、Server Islandsは有効です。通常、プレビューにはSSRが必要ですが、サイト全体をSSR化するとキャッシュ効率が落ちます。プレビュー対象のコンポーネントのみをアイランド化することで、本番環境の静的パフォーマンスを維持したまま、プレビュー機能を共存させることが可能です。

### **3.3 パフォーマンスとセキュリティへの配慮**

Server Islandsの導入は、サイトの「重さ」に対して非常にポジティブな影響を与えます。従来のクライアントサイドフェッチ（SPAパターン）と比較すると、以下の点で優れています。

| 指標 | クライアントサイドフェッチ (React/Vue) | Server Islands (Astro) |
| :---- | :---- | :---- |
| **JavaScriptバンドルサイズ** | 大 (ランタイム \+ フェッチロジック) | 極小 (Astro内部スクリプトのみ) |
| **ハイドレーション** | 必要 (CPU負荷あり) | 不要 (HTML置換のみ) |
| **データ隠蔽** | APIキーが漏洩するリスクあり | サーバー内で完結 (安全) |
| **SEO** | クローラーによる解釈が不安定な場合あり | フォールバックまたは遅延HTMLとして処理 |

特筆すべきはセキュリティです。components/PopularPosts.astro 内のコードはサーバー（エッジ）でのみ実行されるため、microCMSのAPIキーやアナリティクスのトークンがクライアントに送信されることはありません3。また、AstroはServer Islandsへ渡されるPropsを自動的に暗号化し、改竄を防止する署名メカニズムを備えています12。これにより、セキュアかつ高速な動的コンテンツ配信が実現します。

## ---

**4\. ClientRouter (旧View Transitions) によるUXの刷新**

2025年のWeb標準において、ページ遷移時のユーザー体験（UX）は極めて重要な要素です。従来のMPA（Multi-Page Application）では、リンクをクリックするたびに画面が白くなり（フラッシュ）、CSSやスクリプトが再読み込みされる「硬い」遷移が一般的でした。Astro 5.0の **ClientRouter**（旧称 \<ViewTransitions /\>）は、MPAのアーキテクチャを維持したまま、SPA（Single Page Application）のような流体的な遷移を実現します5。

### **4.1 ClientRouter の動作原理と実装**

ClientRouterは、ブラウザ標準の **View Transitions API** をラップし、フォールバック機能を提供します。ユーザーがリンクをクリックすると、ClientRouterは以下の処理を行います。

1. **ナビゲーションのインターセプト**: ブラウザのデフォルトのページ読み込みをキャンセルします。  
2. **バックグラウンドフェッチ**: 次のページのHTMLを非同期で取得します。  
3. **DOMの差分更新**: 現在のページの \<body\> を新しいページの \<body\> に置換します。  
4. **状態の保持**: \<head\> 内のスクリプトや、transition:persist が付与された要素（動画プレーヤーやスクロール位置など）の状態を維持します。

実装は非常にシンプルで、共通のレイアウトファイル（Layout.astroなど）の \<head\> にコンポーネントを追加するだけです。

コード スニペット

\---  
import { ClientRouter } from 'astro:transitions';  
\---  
\<head\>  
  \<ClientRouter /\>  
\</head\>

### **4.2 サイトパフォーマンスとバンドルサイズへの影響**

「ルーターを追加する」と聞くと、React Routerのような重量級ライブラリ（数十KB〜）を想像しがちですが、AstroのClientRouterは極めて軽量です。リサーチによると、ClientRouterを有効にすることによるバンドルサイズの増加は **約4KB〜6KB (Gzipped)** 程度に留まります15。これは、サイト全体のパフォーマンス予算に対して無視できるレベルです。

一方、UX上のメリットは計り知れません。特に **Core Web Vitals** の観点では以下の影響があります。

* **LCP (Largest Contentful Paint)**: 遷移先の画像やコンテンツがクロスフェードで表示されるため、ユーザーの体感速度（Perceived Performance）は向上します。ただし、技術的なLCP計測においては、APIによる待機時間が加算される可能性があるため、重要な要素には transition:animate="initial" を設定して即時表示させるチューニングが必要な場合があります16。  
* **CLS (Cumulative Layout Shift)**: ページ遷移間で共通の要素（例えば、記事一覧のサムネイルと記事詳細のヒーロー画像）に同一の transition:name を付与することで、要素が滑らかに変形・移動するモーフィングアニメーションが自動生成されます。これにより、視覚的なレイアウトのズレがなくなり、非常に高品質な体験を提供できます。

### **4.3 メモリリークのリスクと対策**

SPAライクな動作をさせる際、最も懸念されるのが **メモリリーク** です。ページ遷移を繰り返してもブラウザのリロードが発生しないため、不適切に記述されたサードパーティスクリプト（広告タグやアナリティクス）がゴミとしてメモリに残る可能性があります。

AstroのClientRouterは、遷移時に astro:page-load や astro:before-preparation といったライフサイクルイベントを発火させます。momo1105.com に既存のJavaScript（スライダーやモーダルなど）がある場合、それらを以下のように修正する必要があります10。

**修正前（従来のMPA）:**

JavaScript

// ページロード時に一度だけ実行される  
document.addEventListener('DOMContentLoaded', () \=\> {  
  setupSlider();  
});

**修正後（ClientRouter対応）:**

JavaScript

// 遷移のたびに実行される  
document.addEventListener('astro:page-load', () \=\> {  
  setupSlider();  
});  
// 必要に応じてクリーンアップ処理も記述  
document.addEventListener('astro:before-swap', () \=\> {  
  destroySlider();  
});

このパターンを徹底することで、長時間の閲覧でもブラウザが重くならない堅牢なサイトを構築できます。

## ---

**5\. 次世代CSS技術によるJavaScript依存からの脱却**

パフォーマンス最適化の究極形は「JavaScriptを書かないこと」です。2025年のCSS標準機能は飛躍的に進化しており、これまでJavaScript（ライブラリ）に依存していたレイアウト制御やアニメーションの多くを、CSSのみで実現可能にしています。

### **5.1 Container Queries によるコンポーネント設計の革命**

従来のレスポンシブデザインは「画面幅（Viewport）」に依存するメディアクエリ（@media）が主流でした。しかし、microCMSで管理されるリッチなコンテンツは、サイドバー、メインカラム、グリッドレイアウトなど、様々な場所に配置される可能性があります。画面幅ではなく「親コンテナの幅」に応じてスタイルを変える **Container Queries** は、コンポーネントの再利用性を劇的に高めます7。

**実装例: ブログカードコンポーネント**

CSS

/\* 親要素をコンテナとして定義 \*/  
.card-wrapper {  
  container-type: inline-size;  
  container-name: card-wrapper;  
}

.card {  
  display: flex;  
  flex-direction: column; /\* デフォルトは縦積み \*/  
}

/\* コンテナ幅が500px以上あれば横並びにする \*/  
@container card-wrapper (min-width: 500px) {  
 .card {  
    flex-direction: row;  
    align-items: center;  
  }  
 .card-image {  
    width: 30%; /\* 画像サイズもコンテキストに応じて調整 \*/  
  }  
}

この技術により、JavaScriptによる ResizeObserver の監視が不要となり、レンダリング負荷が軽減されます。ブラウザサポート率も2025年時点で約94%に達しており、ポリフィルなしで本番投入が可能な水準です19。

### **5.2 Scroll-driven Animations によるメインスレッドの解放**

スクロールに連動したアニメーション（パララックス、プログレスバー、ふわっと表示される要素）は、これまで AOS や GSAP といったライブラリが使用されてきました。これらはメインスレッドでスクロールイベントを監視するため、スクロールのカクつき（ジャンク）の原因となりがちでした。

CSSの **Scroll-driven Animations**（animation-timeline）を使用すると、これらのアニメーションをブラウザの **コンポジター・スレッド（Compositor Thread）** で処理できます6。これにより、メインスレッドが重いJavaScript処理（例えばハイドレーションやデータ解析）で忙しい状態でも、アニメーションは滑らかに動作し続けます。

**実装例: 読了プログレスバー**

CSS

/\* JavaScript一切不要 \*/  
.reading-progress {  
  position: fixed;  
  top: 0;  
  left: 0;  
  width: 100%;  
  height: 4px;  
  background: var(--primary-color);  
  transform-origin: 0 50%;  
  animation: grow-progress auto linear;  
  /\* アニメーションの進行をスクロール位置にバインド \*/  
  animation\-timeline: scroll(root);  
}

@keyframes grow-progress {  
  from { transform: scaleX(0); }  
  to { transform: scaleX(1); }  
}

このアプローチは、サイトの「重さ」を物理的（JSファイルサイズ削減）にも体感的（フレームレート向上）にも改善します。momo1105.com のような記事主体のサイトにおいて、読書体験を損なわずにリッチな演出を加える最適な手段です。

## ---

**6\. microCMSアセットの最適化戦略**

画像はWebサイトの総容量の大部分を占めます。Astroの \<Image /\> コンポーネントとmicroCMSの画像APIを組み合わせることで、自動的かつ高度な最適化が可能です。

### **6.1 リモート画像の最適化と inferSize**

Astro Assetsは、ローカル画像に対しては自動的にサイズ情報を取得しますが、microCMSのようなリモート画像の場合、そのままではアスペクト比が不明なためCLSが発生します。Astro 5.0では以下の2つのアプローチが可能です21。

1. **inferSize 属性**:  
   コード スニペット  
   \<Image src={remoteUrl} inferSize={true} alt="..." /\>

   これはビルド時に画像ヘッダーを取得しに行きますが、大量の画像がある場合はビルド時間が延びる原因となります。  
2. microCMSのメタデータ活用（推奨）:  
   microCMSのAPIは画像の width と height をレスポンスに含んでいます。これを直接コンポーネントに渡すのが最も効率的です。  
   コード スニペット  
   \---  
   import { Image } from 'astro:assets';  
   const { eyecatch } \= Astro.props;  
   \---  
   \<Image   
     src={eyecatch.url}   
     width={eyecatch.width}   
     height={eyecatch.height}  
     format="avif"   
     quality="mid"  
     alt="記事サムネイル"  
   /\>

### **6.2 AVIFフォーマットとレスポンシブ対応**

microCMSの画像配信CDN（imgix互換）は優秀ですが、Astroの \<Image /\> を通すことで、ブラウザの対応状況に応じた **AVIF** 形式への自動変換や、srcset の自動生成が行われます。これにより、特にモバイル回線での表示速度（LCP）が大幅に向上します。momo1105.com の既存の \<img\> タグをすべて \<Image /\> に置き換えるだけで、画像転送量を平均30〜50%削減できる可能性があります。

## ---

**7\. 結論と実装ロードマップ**

momo1105.com の現在のスタック（Astro \+ microCMS）は、2025年のWeb標準においても非常に強力な基盤です。しかし、本レポートで解説した新技術を導入することで、そのポテンシャルを限界まで引き出すことができます。

### **7.1 推奨される実装ステップ**

1. **基盤アップデート (Phase 1\)**:  
   * Astro 5.0へのアップグレード。  
   * src/content.config.ts を作成し、microcms-astro-loader を導入してデータ取得ロジックをContent Layerへ移行。これによりビルド安定性を確保。  
2. **アセット最適化 (Phase 2\)**:  
   * すべての画像タグをAstro Assetsの \<Image /\> に置換し、microCMSのwidth/heightデータを連携。CLSを撲滅。  
3. **UX向上 (Phase 3\)**:  
   * ClientRouter を導入し、MPAの高速性とSPAの操作感を融合。  
   * JavaScriptで実装されているスクロールアニメーションやレイアウト制御を、CSS（Container Queries / Scroll-driven Animations）に書き換え、メインスレッド負荷を低減。  
4. **動的化 (Phase 4\)**:  
   * 必要に応じて Server Islands を導入し、静的キャッシュと動的コンテンツ（ランキング等）を共存させる。

これらの施策を実行することで、momo1105.com は「高速で読みやすく、かつリッチな体験」を提供する、2025年のWebにおける理想的な形へと進化するでしょう。技術的な複雑さをAstroフレームワーク側（およびブラウザネイティブ機能）にオフロードすることで、運用者はコンテンツ制作という本質的な価値提供に集中することが可能となります。

#### **引用文献**

1. Content collections \- Astro Docs, 12月 27, 2025にアクセス、 [https://docs.astro.build/en/guides/content-collections/](https://docs.astro.build/en/guides/content-collections/)  
2. Astro 5.0 Beta Release, 12月 27, 2025にアクセス、 [https://astro.build/blog/astro-5-beta/](https://astro.build/blog/astro-5-beta/)  
3. Server islands | Docs, 12月 27, 2025にアクセス、 [https://docs.astro.build/en/guides/server-islands/](https://docs.astro.build/en/guides/server-islands/)  
4. How Astro's server islands deliver progressive rendering for your sites \- Netlify Developers, 12月 27, 2025にアクセス、 [https://developers.netlify.com/guides/how-astros-server-islands-deliver-progressive-rendering-for-your-sites/](https://developers.netlify.com/guides/how-astros-server-islands-deliver-progressive-rendering-for-your-sites/)  
5. View Transition API: Single Page Apps Without a Framework \- DebugBear, 12月 27, 2025にアクセス、 [https://www.debugbear.com/blog/view-transitions-spa-without-framework](https://www.debugbear.com/blog/view-transitions-spa-without-framework)  
6. CSS scroll-driven animations \- MDN Web Docs, 12月 27, 2025にアクセス、 [https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven\_animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)  
7. CSS Container Queries Tutorial for Beginners \- DEV Community, 12月 27, 2025にアクセス、 [https://dev.to/mechcloud\_academy/css-container-queries-tutorial-for-beginners-30em](https://dev.to/mechcloud_academy/css-container-queries-tutorial-for-beginners-30em)  
8. Astro Content Loader API | Docs, 12月 27, 2025にアクセス、 [https://docs.astro.build/en/reference/content-loader-reference/](https://docs.astro.build/en/reference/content-loader-reference/)  
9. microcms-astro-loader CDN by jsDelivr \- A CDN for npm and GitHub, 12月 27, 2025にアクセス、 [https://www.jsdelivr.com/package/npm/microcms-astro-loader](https://www.jsdelivr.com/package/npm/microcms-astro-loader)  
10. Out of memory during build · Issue \#10485 · withastro/astro \- GitHub, 12月 27, 2025にアクセス、 [https://github.com/withastro/astro/issues/10485](https://github.com/withastro/astro/issues/10485)  
11. Astro running out of heap on inlined assets in markdown · Issue \#6135 \- GitHub, 12月 27, 2025にアクセス、 [https://github.com/withastro/astro/issues/6135](https://github.com/withastro/astro/issues/6135)  
12. Optimized Remote Images : r/astrojs \- Reddit, 12月 27, 2025にアクセス、 [https://www.reddit.com/r/astrojs/comments/1dhc7ae/optimized\_remote\_images/](https://www.reddit.com/r/astrojs/comments/1dhc7ae/optimized_remote_images/)  
13. Best practices for upgrading Astro Runtime on Astro | Astronomer Docs, 12月 27, 2025にアクセス、 [https://www.astronomer.io/docs/astro/best-practices/upgrading-astro-runtime](https://www.astronomer.io/docs/astro/best-practices/upgrading-astro-runtime)  
14. Astro astro@5.0.0-alpha.8 Release \- GitClear, 12月 27, 2025にアクセス、 [https://www.gitclear.com/open\_repos/withastro/astro/release/astro@5.0.0-alpha.8](https://www.gitclear.com/open_repos/withastro/astro/release/astro@5.0.0-alpha.8)  
15. Astro View Transitions: Give Your Website App-Like Smooth Experience with Just 2 Lines of Code, 12月 27, 2025にアクセス、 [https://eastondev.com/blog/en/posts/dev/20251202-astro-view-transitions-guide/](https://eastondev.com/blog/en/posts/dev/20251202-astro-view-transitions-guide/)  
16. The Impact of CSS View Transitions on Web Performance, 12月 27, 2025にアクセス、 [https://www.corewebvitals.io/pagespeed/view-transition-web-performance](https://www.corewebvitals.io/pagespeed/view-transition-web-performance)  
17. Frontend memory leaks, from mysterious crashes to stability | by Asier \- Medium, 12月 27, 2025にアクセス、 [https://medium.com/@aadurizs/frontend-memory-leaks-from-mysterious-crashes-to-stability-c88cc4067cb9](https://medium.com/@aadurizs/frontend-memory-leaks-from-mysterious-crashes-to-stability-c88cc4067cb9)  
18. CSS Container Queries, 12月 27, 2025にアクセス、 [https://css-tricks.com/css-container-queries/](https://css-tricks.com/css-container-queries/)  
19. CSS Container Queries (Size) | Can I use... Support tables for HTML5, CSS3, etc \- CanIUse, 12月 27, 2025にアクセス、 [https://caniuse.com/css-container-queries](https://caniuse.com/css-container-queries)  
20. A case study on scroll-driven animations performance | Blog \- Chrome for Developers, 12月 27, 2025にアクセス、 [https://developer.chrome.com/blog/scroll-animation-performance-case-study](https://developer.chrome.com/blog/scroll-animation-performance-case-study)  
21. How to optimize images in Astro: A step-by-step guide | Uploadcare, 12月 27, 2025にアクセス、 [https://uploadcare.com/blog/how-to-optimize-images-in-astro/](https://uploadcare.com/blog/how-to-optimize-images-in-astro/)  
22. Images \- Astro Docs, 12月 27, 2025にアクセス、 [https://docs.astro.build/en/guides/images/](https://docs.astro.build/en/guides/images/)