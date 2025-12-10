/**
 * Core Web Vitals Monitoring Utility
 * Measures and logs LCP, INP, and CLS metrics for performance monitoring
 */

export function measureWebVitals() {
    if (!('PerformanceObserver' in window)) {
        console.warn('PerformanceObserver not supported');
        return;
    }

    // Largest Contentful Paint (LCP)
    // Target: < 1.5s (2025 standard)
    try {
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as any;
            const lcp = lastEntry.renderTime || lastEntry.loadTime;
            console.log('✅ LCP:', Math.round(lcp), 'ms', lcp < 1500 ? '(Good)' : lcp < 2500 ? '(Needs Improvement)' : '(Poor)');
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
        console.warn('LCP measurement failed:', e);
    }

    // Interaction to Next Paint (INP) - Replaces FID in 2025
    // Target: < 200ms
    try {
        const inpObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                const duration = (entry as any).duration;
                if (duration > 40) { // Only log significant interactions
                    console.log('⚡ INP:', Math.round(duration), 'ms', duration < 200 ? '(Good)' : duration < 500 ? '(Needs Improvement)' : '(Poor)');
                }
            }
        });
        inpObserver.observe({ type: 'event', buffered: true } as any);
    } catch (e) {
        console.warn('INP measurement failed:', e);
    }

    // Cumulative Layout Shift (CLS)
    // Target: < 0.05 (2025 standard)
    try {
        let clsScore = 0;
        const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!(entry as any).hadRecentInput) {
                    clsScore += (entry as any).value;
                }
            }
            console.log('📊 CLS:', clsScore.toFixed(3), clsScore < 0.05 ? '(Good)' : clsScore < 0.1 ? '(Needs Improvement)' : '(Poor)');
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
        console.warn('CLS measurement failed:', e);
    }

    console.log('📈 Core Web Vitals monitoring active');
}

// Auto-initialize for Astro View Transitions compatibility
if (typeof window !== 'undefined') {
    document.addEventListener('astro:page-load', () => {
        measureWebVitals();
    });
}
