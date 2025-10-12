import React, { useState, useCallback, useEffect, useRef } from 'react';
import interact from 'interactjs';
import { Button, Slider, ColorPicker } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useAbsoluteImageScaling } from './AbsoluteImageScaler';
import './AbsoluteImageContainer.scss';

const InteractDraggableRegion = ({ regions = [], onRegionsChange, imageRef, imageUrl }) => {
    const [selectedRegion, setSelectedRegion] = useState(null);
    const scaling = useAbsoluteImageScaling(imageRef);
    const regionRefs = useRef({});
    const regionsRef = useRef(regions);

    useEffect(() => {
        regionsRef.current = regions;
    }, [regions]);

    const addRegion = () => {
        const newRegion = {
            id: Date.now().toString(),
            x: 30,
            y: 30,
            width: 20,
            height: 20,
            color: '#ff0000',
            opacity: 0.7,
        };
        onRegionsChange([...regions, newRegion]);
        setSelectedRegion(newRegion.id);
    };

    const updateRegion = useCallback(
        (regionId, updates) => {
            onRegionsChange((prevRegions) =>
                prevRegions.map((region) => (region.id === regionId ? { ...region, ...updates } : region)),
            );
        },
        [onRegionsChange],
    );

    const deleteRegion = (regionId) => {
        const updatedRegions = regions.filter((region) => region.id !== regionId);
        onRegionsChange(updatedRegions);
        if (selectedRegion === regionId) {
            setSelectedRegion(null);
        }
    };

    const selectRegion = (regionId) => {
        setSelectedRegion(regionId);
    };

    // Setup interact.js for a region - optimized to prevent re-renders
    const setupInteract = useCallback(
        (regionId) => {
            const element = regionRefs.current[regionId];

            if (!element || !scaling.isReady) return;

            // Calculate initial position in pixels
            // const region = regions.find((r) => r.id === regionId);
            // if (!region) return;

            const region = regionsRef.current.find((r) => r.id === regionId);
            if (!region) return;

            const left = scaling.offsetX + (region.x / 100) * scaling.imageWidth;
            const top = scaling.offsetY + (region.y / 100) * scaling.imageHeight;
            const width = (region.width / 100) * scaling.imageWidth;
            const height = (region.height / 100) * scaling.imageHeight;

            // Set initial position
            element.style.left = `${left}px`;
            element.style.top = `${top}px`;
            element.style.width = `${width}px`;
            element.style.height = `${height}px`;

            // Setup drag with throttling
            let dragTimeout;
            interact(element)
                .draggable({
                    onstart: (event) => {
                        event.target.classList.add('dragging');
                    },
                    onmove: (event) => {
                        // Throttle drag updates to prevent lag
                        if (dragTimeout) return;

                        dragTimeout = setTimeout(() => {
                            const newLeft = parseFloat(event.target.style.left) + event.dx;
                            const newTop = parseFloat(event.target.style.top) + event.dy;

                            // Keep within image bounds
                            const minLeft = scaling.offsetX;
                            const maxLeft = scaling.offsetX + scaling.imageWidth - parseFloat(event.target.style.width);
                            const minTop = scaling.offsetY;
                            const maxTop =
                                scaling.offsetY + scaling.imageHeight - parseFloat(event.target.style.height);

                            const clampedLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));
                            const clampedTop = Math.max(minTop, Math.min(maxTop, newTop));

                            event.target.style.left = `${clampedLeft}px`;
                            event.target.style.top = `${clampedTop}px`;

                            dragTimeout = null;
                        }, 0); // ~60fps
                    },
                    onend: (event) => {
                        event.target.classList.remove('dragging');
                        if (dragTimeout) {
                            clearTimeout(dragTimeout);
                            dragTimeout = null;
                        }

                        // Convert back to percentage
                        const left = parseFloat(event.target.style.left);
                        const top = parseFloat(event.target.style.top);
                        const width = parseFloat(event.target.style.width);
                        const height = parseFloat(event.target.style.height);

                        const percentX = ((left - scaling.offsetX) / scaling.imageWidth) * 100;
                        const percentY = ((top - scaling.offsetY) / scaling.imageHeight) * 100;
                        const percentWidth = (width / scaling.imageWidth) * 100;
                        const percentHeight = (height / scaling.imageHeight) * 100;

                        updateRegion(regionId, {
                            x: Math.max(0, Math.min(100 - percentWidth, percentX)),
                            y: Math.max(0, Math.min(100 - percentHeight, percentY)),
                            width: Math.max(5, Math.min(100, percentWidth)),
                            height: Math.max(5, Math.min(100, percentHeight)),
                        });
                    },
                })
                .resizable({
                    edges: { left: true, right: true, bottom: true, top: true },
                    listeners: {
                        move: (event) => {
                            let { x, y, width, height } = event.rect;

                            // Keep within image bounds
                            const minLeft = scaling.offsetX;
                            const maxLeft = scaling.offsetX + scaling.imageWidth;
                            const minTop = scaling.offsetY;
                            const maxTop = scaling.offsetY + scaling.imageHeight;

                            x = Math.max(minLeft, Math.min(maxLeft - width, x));
                            y = Math.max(minTop, Math.min(maxTop - height, y));
                            width = Math.max(20, Math.min(scaling.imageWidth, width));
                            height = Math.max(20, Math.min(scaling.imageHeight, height));

                            event.target.style.left = `${x}px`;
                            event.target.style.top = `${y}px`;
                            event.target.style.width = `${width}px`;
                            event.target.style.height = `${height}px`;
                        },
                    },
                    onend: (event) => {
                        // Convert back to percentage
                        const left = parseFloat(event.target.style.left);
                        const top = parseFloat(event.target.style.top);
                        const width = parseFloat(event.target.style.width);
                        const height = parseFloat(event.target.style.height);

                        const percentX = ((left - scaling.offsetX) / scaling.imageWidth) * 100;
                        const percentY = ((top - scaling.offsetY) / scaling.imageHeight) * 100;
                        const percentWidth = (width / scaling.imageWidth) * 100;
                        const percentHeight = (height / scaling.imageHeight) * 100;

                        updateRegion(regionId, {
                            x: Math.max(0, Math.min(100 - percentWidth, percentX)),
                            y: Math.max(0, Math.min(100 - percentHeight, percentY)),
                            width: Math.max(5, Math.min(100, percentWidth)),
                            height: Math.max(5, Math.min(100, percentHeight)),
                        });
                    },
                });
        },
        [scaling, updateRegion], // Remove regions and imageRef from dependencies
    );

    // Setup interact for all regions when scaling is ready
    useEffect(() => {
        if (scaling.isReady) {
            // Cleanup existing instances first
            regions.forEach((region) => {
                const element = regionRefs.current[region.id];
                if (element) {
                    interact(element).unset();
                }
            });

            // Setup new instances
            regions.forEach((region) => {
                setupInteract(region.id);
            });
        }
    }, [scaling.isReady, regions.length]); // Remove setupInteract from dependencies

    // Cleanup interact instances
    useEffect(() => {
        return () => {
            regions.forEach((region) => {
                const element = regionRefs.current[region.id];
                if (element) {
                    interact(element).unset();
                }
            });
        };
    }, []);

    return (
        <div className="draggable-region-container">
            <div className="region-controls">
                <Button type="primary" onClick={addRegion}>
                    Add Mistake Region
                </Button>
                {selectedRegion && (
                    <div className="region-settings">
                        <h4>Region Settings</h4>
                        <div className="setting-item">
                            <label>Opacity:</label>
                            <Slider
                                min={0}
                                max={1}
                                step={0.1}
                                value={regions.find((r) => r.id === selectedRegion)?.opacity || 0.7}
                                onChange={(value) => updateRegion(selectedRegion, { opacity: value })}
                            />
                        </div>
                        <div className="setting-item">
                            <label>Color:</label>
                            <ColorPicker
                                value={regions.find((r) => r.id === selectedRegion)?.color || '#ff0000'}
                                onChange={(color) => updateRegion(selectedRegion, { color: color.toHexString() })}
                            />
                        </div>
                        <Button danger icon={<DeleteOutlined />} onClick={() => deleteRegion(selectedRegion)}>
                            Delete Region
                        </Button>
                    </div>
                )}
            </div>

            <div className="absolute-admin-container" ref={imageRef}>
                {imageUrl && <img src={imageUrl} alt="Game Image" className="game-image" draggable={false} />}
                {regions &&
                    regions.map((region) => (
                        <InteractRegionItem
                            key={region.id}
                            region={region}
                            isSelected={selectedRegion === region.id}
                            onSelect={() => selectRegion(region.id)}
                            regionRef={(el) => (regionRefs.current[region.id] = el)}
                            scaling={scaling}
                        />
                    ))}
            </div>
        </div>
    );
};

const InteractRegionItem = ({ region, isSelected, onSelect, regionRef, scaling }) => {
    if (!scaling.isReady || !scaling.imageWidth || !scaling.imageHeight) return null;

    // Calculate absolute pixel positions
    const left = scaling.offsetX + (region.x / 100) * scaling.imageWidth;
    const top = scaling.offsetY + (region.y / 100) * scaling.imageHeight;
    const width = (region.width / 100) * scaling.imageWidth;
    const height = (region.height / 100) * scaling.imageHeight;

    const style = {
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: region.color,
        opacity: region.opacity,
        border: isSelected ? '2px solid #1890ff' : '2px solid transparent',
        cursor: 'move',
        zIndex: isSelected ? 10 : 1,
        borderRadius: '4px',
        userSelect: 'none',
        // Ensure regions are visible and interactive
        pointerEvents: 'auto',
    };

    return (
        <div
            ref={regionRef}
            style={style}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
            className={`region-item ${isSelected ? 'selected' : ''}`}
        />
    );
};

export default InteractDraggableRegion;
