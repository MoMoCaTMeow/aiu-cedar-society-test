/**
 * Lazy Loading Utility using Intersection Observer V2
 * Provides high-performance image lazy loading with progressive enhancement
 */

interface LazyLoadOptions {
    rootMargin?: string;
    threshold?: number;
}

export function setupLazyLoading(options: LazyLoadOptions = {}) {
    const {
        rootMargin = '50px', // Load images 50px before they enter viewport
        threshold = 0.01
    } = options;

    // Progressive Enhancement: Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
        // Fallback: Load all images immediately
        loadAllImages();
        return;
    }

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target as HTMLImageElement;
                loadImage(img);
                imageObserver.unobserve(img);
            }
        });
    }, {
        rootMargin,
        threshold
    });

    // Observe all lazy images
    const lazyImages = document.querySelectorAll('img.lazy');
    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });

    console.log(`Lazy loading initialized for ${lazyImages.length} images`);
}

function loadImage(img: HTMLImageElement) {
    // Load actual image
    if (img.dataset.src) {
        img.src = img.dataset.src;
    }
    if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
    }

    // Remove loading class and add loaded class
    img.classList.remove('lazy', 'loading');
    img.classList.add('loaded');

    // Optional: Add fade-in animation
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease-in-out';

    img.onload = () => {
        img.style.opacity = '1';
    };
}

function loadAllImages() {
    // Fallback for browsers without Intersection Observer
    const lazyImages = document.querySelectorAll('img.lazy');
    lazyImages.forEach(img => {
        loadImage(img as HTMLImageElement);
    });
    console.log('Lazy loading fallback: Loaded all images immediately');
}

// Auto-initialize on page load (for Astro View Transitions compatibility)
if (typeof window !== 'undefined') {
    document.addEventListener('astro:page-load', () => {
        setupLazyLoading();
    });
}
