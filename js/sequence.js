/* ============================================
   AURORA Pro — Image Sequence Scroll Engine
   ============================================
   Preloads all 40 frames and draws the current
   frame to a sticky fullscreen canvas based on
   scroll position. Apple-style frame scrubbing.
   ============================================ */

const ImageSequence = (() => {
    'use strict';

    // --- Configuration ---
    const FRAME_COUNT = 200;
    const IMAGE_PATH = 'images/ezgif-frame-';
    const IMAGE_EXT = '.png';

    // --- State ---
    let canvas, ctx;
    const images = [];
    let loadedCount = 0;
    let currentFrame = 0;
    let isReady = false;
    let canvasWidth = 0;
    let canvasHeight = 0;

    // Callbacks
    let onProgressCallback = null;
    let onReadyCallback = null;

    /**
     * Get the padded filename for a frame number (1-indexed)
     */
    function getFramePath(index) {
        const num = String(index).padStart(3, '0');
        return `${IMAGE_PATH}${num}${IMAGE_EXT}`;
    }

    /**
     * Preload all images into memory
     */
    function preloadImages() {
        return new Promise((resolve) => {
            for (let i = 1; i <= FRAME_COUNT; i++) {
                const img = new Image();
                img.src = getFramePath(i);

                img.onload = () => {
                    loadedCount++;
                    const progress = Math.round((loadedCount / FRAME_COUNT) * 100);
                    if (onProgressCallback) onProgressCallback(progress);

                    if (loadedCount === FRAME_COUNT) {
                        isReady = true;
                        if (onReadyCallback) onReadyCallback();
                        resolve();
                    }
                };

                img.onerror = () => {
                    console.warn(`Failed to load frame: ${getFramePath(i)}`);
                    loadedCount++;
                    if (loadedCount === FRAME_COUNT) {
                        isReady = true;
                        if (onReadyCallback) onReadyCallback();
                        resolve();
                    }
                };

                images[i - 1] = img;
            }
        });
    }

    /**
     * Draw a specific frame to the canvas (cover-fit)
     */
    function drawFrame(frameIndex) {
        if (!ctx || !images[frameIndex]) return;

        const img = images[frameIndex];
        if (!img.complete || img.naturalWidth === 0) return;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Cover-fit calculation (like CSS background-size: cover)
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = canvasWidth / canvasHeight;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (canvasRatio > imgRatio) {
            // Canvas is wider — fit to width
            drawWidth = canvasWidth;
            drawHeight = canvasWidth / imgRatio;
            offsetX = 0;
            offsetY = (canvasHeight - drawHeight) / 2;
        } else {
            // Canvas is taller — fit to height
            drawHeight = canvasHeight;
            drawWidth = canvasHeight * imgRatio;
            offsetX = (canvasWidth - drawWidth) / 2;
            offsetY = 0;
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        currentFrame = frameIndex;
    }

    /**
     * Set the frame based on a progress value (0 to 1)
     * Uses smooth interpolation for buttery transitions
     */
    let targetFrame = 0;
    let displayFrame = 0;
    let rafId = null;

    function smoothRender() {
        if (!isReady) return;

        // Lerp towards target frame
        displayFrame += (targetFrame - displayFrame) * 0.15;

        const frameIndex = Math.min(
            FRAME_COUNT - 1,
            Math.max(0, Math.round(displayFrame))
        );

        if (frameIndex !== currentFrame) {
            drawFrame(frameIndex);
        }

        // Keep animating if not close enough
        if (Math.abs(targetFrame - displayFrame) > 0.1) {
            rafId = requestAnimationFrame(smoothRender);
        } else {
            rafId = null;
        }
    }

    function setProgress(progress) {
        if (!isReady) return;
        targetFrame = Math.min(
            FRAME_COUNT - 1,
            Math.max(0, progress * (FRAME_COUNT - 1))
        );

        if (!rafId) {
            rafId = requestAnimationFrame(smoothRender);
        }
    }

    /**
     * Handle window resize
     */
    function handleResize() {
        if (!canvas) return;
        const dpr = Math.min(window.devicePixelRatio, 2);
        canvasWidth = window.innerWidth * dpr;
        canvasHeight = window.innerHeight * dpr;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';

        // Redraw current frame at new size
        if (isReady) {
            drawFrame(currentFrame);
        }
    }

    /**
     * Initialize the sequence engine
     */
    function init(options = {}) {
        canvas = document.getElementById('sequence-canvas');
        if (!canvas) {
            console.error('sequence-canvas not found');
            return Promise.reject();
        }

        ctx = canvas.getContext('2d');

        if (options.onProgress) onProgressCallback = options.onProgress;
        if (options.onReady) onReadyCallback = options.onReady;

        // Set initial canvas size
        handleResize();
        window.addEventListener('resize', handleResize, { passive: true });

        // Start preloading
        return preloadImages().then(() => {
            // Draw first frame immediately
            drawFrame(0);
        });
    }

    /**
     * Public API
     */
    return {
        init,
        setProgress,
        drawFrame,
        get isReady() { return isReady; },
        get currentFrame() { return currentFrame; },
        get frameCount() { return FRAME_COUNT; },
        get progress() { return loadedCount / FRAME_COUNT; }
    };
})();
