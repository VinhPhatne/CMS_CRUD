import React, { useState, useEffect, useCallback, useRef } from 'react';

// Perfect scaling scaler - fix sub-pixel rendering issues
export const usePerfectImageScaling = (imageRef) => {
    const [scaling, setScaling] = useState({
        scaleX: 1,
        scaleY: 1,
        offsetX: 0,
        offsetY: 0,
        imageWidth: 0,
        imageHeight: 0,
        containerWidth: 0,
        containerHeight: 0,
        isReady: false,
    });

    const lastImageSrc = useRef(null);
    const calculationTimeout = useRef(null);
    const isCalculating = useRef(false);

    const calculatePerfectScaling = useCallback(() => {
        if (!imageRef.current || isCalculating.current) return;

        const container = imageRef.current;
        const img = container.querySelector('.game-image');

        if (!img || !img.complete || img.naturalWidth === 0) {
            if (calculationTimeout.current) {
                clearTimeout(calculationTimeout.current);
            }
            calculationTimeout.current = setTimeout(calculatePerfectScaling, 50);
            return;
        }

        isCalculating.current = true;

        // Check if image source changed
        if (lastImageSrc.current !== img.src) {
            lastImageSrc.current = img.src;
        }

        // Get actual image dimensions
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;

        if (naturalWidth === 0 || naturalHeight === 0) {
            isCalculating.current = false;
            return;
        }

        // Fixed container dimensions - ALWAYS the same
        const FIXED_CONTAINER_WIDTH = 800;
        const FIXED_CONTAINER_HEIGHT = 500;

        // Calculate how image should be displayed in fixed container
        const aspectRatio = naturalWidth / naturalHeight;
        const containerAspectRatio = FIXED_CONTAINER_WIDTH / FIXED_CONTAINER_HEIGHT;

        let displayedWidth, displayedHeight;

        if (aspectRatio > containerAspectRatio) {
            // Image is wider than container
            displayedWidth = FIXED_CONTAINER_WIDTH;
            displayedHeight = FIXED_CONTAINER_WIDTH / aspectRatio;
        } else {
            // Image is taller than container
            displayedHeight = FIXED_CONTAINER_HEIGHT;
            displayedWidth = FIXED_CONTAINER_HEIGHT * aspectRatio;
        }

        // Calculate scaling factors
        const scaleX = displayedWidth / naturalWidth;
        const scaleY = displayedHeight / naturalHeight;

        // Calculate offset (centering) - always center in fixed container
        // Round to nearest pixel to avoid sub-pixel rendering issues
        const offsetX = Math.round((FIXED_CONTAINER_WIDTH - displayedWidth) / 2);
        const offsetY = Math.round((FIXED_CONTAINER_HEIGHT - displayedHeight) / 2);

        const newScaling = {
            scaleX,
            scaleY,
            offsetX,
            offsetY,
            imageWidth: Math.round(displayedWidth),
            imageHeight: Math.round(displayedHeight),
            containerWidth: FIXED_CONTAINER_WIDTH,
            containerHeight: FIXED_CONTAINER_HEIGHT,
            isReady: true,
        };

        // Only update if values actually changed
        setScaling((prevScaling) => {
            const hasChanged =
                Math.abs(prevScaling.offsetX - offsetX) > 0 ||
                Math.abs(prevScaling.offsetY - offsetY) > 0 ||
                Math.abs(prevScaling.imageWidth - Math.round(displayedWidth)) > 0 ||
                Math.abs(prevScaling.imageHeight - Math.round(displayedHeight)) > 0 ||
                Math.abs(prevScaling.scaleX - scaleX) > 0.0000001 ||
                Math.abs(prevScaling.scaleY - scaleY) > 0.0000001;

            return hasChanged ? newScaling : prevScaling;
        });

        isCalculating.current = false;
    }, [imageRef]);

    useEffect(() => {
        // Calculate immediately on mount
        calculatePerfectScaling();

        // Add image load listener
        const img = imageRef.current?.querySelector('.game-image');
        if (img) {
            img.addEventListener('load', calculatePerfectScaling);
            img.addEventListener('error', calculatePerfectScaling);
        }

        // Cleanup
        return () => {
            if (img) {
                img.removeEventListener('load', calculatePerfectScaling);
                img.removeEventListener('error', calculatePerfectScaling);
            }
            if (calculationTimeout.current) {
                clearTimeout(calculationTimeout.current);
            }
        };
    }, [imageRef, calculatePerfectScaling]);

    // Force recalculation when image changes
    useEffect(() => {
        if (imageRef.current) {
            const img = imageRef.current.querySelector('.game-image');
            if (img && img.src !== lastImageSrc.current) {
                calculatePerfectScaling();
            }
        }
    }, [imageRef, calculatePerfectScaling]);

    return scaling;
};

// Component để render regions với perfect scaling
export const PerfectScaledRegions = ({ regions, scaling, clickedRegions, showRegions }) => {
    if (!showRegions || !scaling.isReady || !scaling.imageWidth || !scaling.imageHeight) return null;

    return (
        <>
            {regions.map((region) => {
                // Calculate absolute pixel positions with integer rounding
                const left = Math.round(scaling.offsetX + (region.x / 100) * scaling.imageWidth);
                const top = Math.round(scaling.offsetY + (region.y / 100) * scaling.imageHeight);
                const width = Math.round((region.width / 100) * scaling.imageWidth);
                const height = Math.round((region.height / 100) * scaling.imageHeight);

                return (
                    <div
                        key={region.id}
                        className={`mistake-region ${clickedRegions.has(region.id) ? 'found' : ''}`}
                        style={{
                            position: 'absolute',
                            left: `${left}px`,
                            top: `${top}px`,
                            width: `${width}px`,
                            height: `${height}px`,
                            backgroundColor: region.color,
                            opacity: clickedRegions.has(region.id) ? 0.3 : region.opacity,
                            border: '2px solid #ff4d4f',
                            borderRadius: '4px',
                            pointerEvents: 'none',
                            zIndex: 10,
                            // Anti-aliasing fixes
                            imageRendering: 'pixelated',
                            backfaceVisibility: 'hidden',
                            transform: 'translateZ(0)',
                        }}
                    />
                );
            })}
        </>
    );
};

// Component để render click effects với perfect scaling
export const PerfectScaledClickEffects = ({ effects, scaling }) => {
    if (!scaling.isReady || !scaling.imageWidth || !scaling.imageHeight) return null;

    return (
        <>
            {effects.map((effect) => {
                const left = Math.round(scaling.offsetX + (effect.x / 100) * scaling.imageWidth);
                const top = Math.round(scaling.offsetY + (effect.y / 100) * scaling.imageHeight);

                return (
                    <div
                        key={effect.id}
                        className="click-effect"
                        style={{
                            position: 'absolute',
                            left: `${left}px`,
                            top: `${top}px`,
                            width: '20px',
                            height: '20px',
                            border: '3px solid #ff4d4f',
                            borderRadius: '50%',
                            pointerEvents: 'none',
                            animation: 'clickRipple 1s ease-out',
                            transform: 'translate(-50%, -50%) translateZ(0)',
                            zIndex: 20,
                            // Anti-aliasing fixes
                            backfaceVisibility: 'hidden',
                        }}
                    />
                );
            })}
        </>
    );
};

// Function để convert click coordinates to percentage với perfect scaling
export const convertClickToPerfectPercentage = (e, imageRef, scaling) => {
    if (!imageRef.current || !scaling.isReady || !scaling.imageWidth || !scaling.imageHeight) {
        return { x: 0, y: 0 };
    }

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate click position relative to image
    const relativeX = x - scaling.offsetX;
    const relativeY = y - scaling.offsetY;

    // Convert to percentage
    const clickX = (relativeX / scaling.imageWidth) * 100;
    const clickY = (relativeY / scaling.imageHeight) * 100;

    return { x: clickX, y: clickY };
};

export default {
    usePerfectImageScaling,
    PerfectScaledRegions,
    PerfectScaledClickEffects,
    convertClickToPerfectPercentage,
};
