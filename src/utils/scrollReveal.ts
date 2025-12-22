/**
 * スクロール連動表示の初期化
 * Intersection Observer APIを使用してパフォーマンス最適化
 */
export function initScrollReveal() {
  // 既にアニメーション済みの要素をスキップ
  if (document.querySelector('.scroll-reveal.revealed')) {
    return;
  }

  const observerOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '0px 0px -50px 0px', // 要素が50px見えたら発動
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // 一度表示したら監視を停止（パフォーマンス向上）
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // すべての.scroll-reveal要素を監視
  document.querySelectorAll('.scroll-reveal').forEach((el) => {
    observer.observe(el);
  });
}

// ページ読み込み時とAstroのページ遷移時に実行
if (typeof window !== 'undefined') {
  // 初回読み込み
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollReveal);
  } else {
    initScrollReveal();
  }

  // AstroのView Transitions対応
  document.addEventListener('astro:page-load', initScrollReveal);
}

