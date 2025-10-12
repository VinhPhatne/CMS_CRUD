import React, { useState, useEffect, useCallback, useRef } from 'react';

// Mobile-aware absolute positioning scaler
export const useAbsoluteImageScaling = (imageRef) => {
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

    const calculateAbsoluteScaling = useCallback(() => {
        if (!imageRef.current || isCalculating.current) return;

        const container = imageRef.current;
        const img = container.querySelector('.game-image');

        if (!img || !img.complete || img.naturalWidth === 0) {
            if (calculationTimeout.current) {
                clearTimeout(calculationTimeout.current);
            }
            calculationTimeout.current = setTimeout(calculateAbsoluteScaling, 50);
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

        // Fixed container dimensions - ALWAYS the same as desktop
        const FIXED_CONTAINER_WIDTH = 800;
        const FIXED_CONTAINER_HEIGHT = 500;

        // Use fixed dimensions to maintain consistency with desktop
        const containerWidth = FIXED_CONTAINER_WIDTH;
        const containerHeight = FIXED_CONTAINER_HEIGHT;

        // Calculate how image should be displayed in actual container
        const aspectRatio = naturalWidth / naturalHeight;
        const containerAspectRatio = containerWidth / containerHeight;

        let displayedWidth, displayedHeight;

        if (aspectRatio > containerAspectRatio) {
            // Image is wider than container
            displayedWidth = containerWidth;
            displayedHeight = containerWidth / aspectRatio;
        } else {
            // Image is taller than container
            displayedHeight = containerHeight;
            displayedWidth = containerHeight * aspectRatio;
        }

        // Calculate scaling factors
        const scaleX = displayedWidth / naturalWidth;
        const scaleY = displayedHeight / naturalHeight;

        // Calculate offset (centering) - center in actual container
        const offsetX = (containerWidth - displayedWidth) / 2;
        const offsetY = (containerHeight - displayedHeight) / 2;

        const newScaling = {
            scaleX,
            scaleY,
            offsetX,
            offsetY,
            imageWidth: displayedWidth,
            imageHeight: displayedHeight,
            containerWidth: containerWidth,
            containerHeight: containerHeight,
            isReady: true,
        };

        // Only update if values actually changed
        setScaling((prevScaling) => {
            const hasChanged =
                Math.abs(prevScaling.offsetX - offsetX) > 0.01 ||
                Math.abs(prevScaling.offsetY - offsetY) > 0.01 ||
                Math.abs(prevScaling.imageWidth - displayedWidth) > 0.01 ||
                Math.abs(prevScaling.imageHeight - displayedHeight) > 0.01 ||
                Math.abs(prevScaling.scaleX - scaleX) > 0.0001 ||
                Math.abs(prevScaling.scaleY - scaleY) > 0.0001;

            return hasChanged ? newScaling : prevScaling;
        });

        isCalculating.current = false;
    }, [imageRef]);

    useEffect(() => {
        // Calculate immediately on mount
        calculateAbsoluteScaling();

        // Add image load listener
        const img = imageRef.current?.querySelector('.game-image');
        if (img) {
            img.addEventListener('load', calculateAbsoluteScaling);
            img.addEventListener('error', calculateAbsoluteScaling);
        }

        // No need for window resize listeners with fixed dimensions

        // Cleanup
        return () => {
            if (img) {
                img.removeEventListener('load', calculateAbsoluteScaling);
                img.removeEventListener('error', calculateAbsoluteScaling);
            }
            if (calculationTimeout.current) {
                clearTimeout(calculationTimeout.current);
            }
        };
    }, [imageRef, calculateAbsoluteScaling]);

    // Force recalculation when image changes
    useEffect(() => {
        if (imageRef.current) {
            const img = imageRef.current.querySelector('.game-image');
            if (img && img.src !== lastImageSrc.current) {
                calculateAbsoluteScaling();
            }
        }
    }, [imageRef, calculateAbsoluteScaling]);

    return scaling;
};

// Component để render regions với absolute positioning
export const AbsoluteScaledRegions = ({ regions, scaling, clickedRegions, showRegions }) => {
    if (!showRegions || !scaling.isReady || !scaling.imageWidth || !scaling.imageHeight) return null;

    return (
        <>
            {regions.map((region) => {
                // Calculate absolute pixel positions
                const left = scaling.offsetX + (region.x / 100) * scaling.imageWidth;
                const top = scaling.offsetY + (region.y / 100) * scaling.imageHeight;
                const width = (region.width / 100) * scaling.imageWidth;
                const height = (region.height / 100) * scaling.imageHeight;

                // Ensure minimum size for mobile touch
                const minSize = 20;
                const finalWidth = Math.max(width, minSize);
                const finalHeight = Math.max(height, minSize);

                return (
                    <div
                        key={region.id}
                        className={`mistake-region ${clickedRegions.has(region.id) ? 'found' : ''}`}
                        style={{
                            position: 'absolute',
                            left: `${left}px`,
                            top: `${top}px`,
                            width: `${finalWidth}px`,
                            height: `${finalHeight}px`,
                            backgroundColor: region.color,
                            opacity: clickedRegions.has(region.id) ? 0.3 : region.opacity,
                            border: '3px solid #ff4d4f', // Thicker border for mobile
                            borderRadius: '4px',
                            pointerEvents: 'auto', // Enable touch on mobile
                            zIndex: 10,
                            // Mobile-specific styles
                            minWidth: `${minSize}px`,
                            minHeight: `${minSize}px`,
                            // Ensure visibility on mobile
                            boxShadow: '0 0 0 2px rgba(255, 77, 79, 0.3)',
                        }}
                    />
                );
            })}
        </>
    );
};

// Component để render click effects với absolute positioning
export const AbsoluteScaledClickEffects = ({ effects, scaling }) => {
    if (!scaling.isReady || !scaling.imageWidth || !scaling.imageHeight) return null;

    return (
        <>
            {effects.map((effect) => {
                const left = scaling.offsetX + (effect.x / 100) * scaling.imageWidth;
                const top = scaling.offsetY + (effect.y / 100) * scaling.imageHeight;

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
                            transform: 'translate(-50%, -50%)',
                            zIndex: 20,
                        }}
                    />
                );
            })}
        </>
    );
};

// Function để convert click coordinates to percentage với absolute positioning
export const convertClickToAbsolutePercentage = (e, imageRef, scaling) => {
    if (!imageRef.current || !scaling.isReady || !scaling.imageWidth || !scaling.imageHeight) {
        return { x: 0, y: 0 };
    }

    const rect = imageRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Handle mobile scaling - reverse the CSS transform scale
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        const scale = window.innerWidth <= 480 ? 0.6 : 0.8;
        x = x / scale;
        y = y / scale;
    }

    // Calculate click position relative to image
    const relativeX = x - scaling.offsetX;
    const relativeY = y - scaling.offsetY;

    // Convert to percentage
    const clickX = (relativeX / scaling.imageWidth) * 100;
    const clickY = (relativeY / scaling.imageHeight) * 100;

    return { x: clickX, y: clickY };
};

export default {
    useAbsoluteImageScaling,
    AbsoluteScaledRegions,
    AbsoluteScaledClickEffects,
    convertClickToAbsolutePercentage,
};
