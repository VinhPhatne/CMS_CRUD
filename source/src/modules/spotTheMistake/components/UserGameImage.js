import React, { useRef, useState, useCallback } from 'react';
import { message } from 'antd';
import {
    useAbsoluteImageScaling,
    AbsoluteScaledRegions,
    AbsoluteScaledClickEffects,
    convertClickToAbsolutePercentage,
} from './AbsoluteImageScaler';
import './AbsoluteImageContainer.scss';

const UserGameImage = ({ imageUrl, mistakeRegions = [], onMistakeFound, isPlaying = false, showRegions = false }) => {
    const imageRef = useRef(null);
    const [clickedRegions, setClickedRegions] = useState(new Set());
    const [clickEffects, setClickEffects] = useState([]);
    const scaling = useAbsoluteImageScaling(imageRef);

    const handleImageClick = useCallback(
        (e) => {
            if (!isPlaying || !imageRef.current) return;

            // Use the absolute scaling utility to get accurate click coordinates
            const { x: clickX, y: clickY } = convertClickToAbsolutePercentage(e, imageRef, scaling);

            // Check if click is within any mistake region
            const clickedRegion = mistakeRegions.find((region) => {
                const regionLeft = region.x;
                const regionRight = region.x + region.width;
                const regionTop = region.y;
                const regionBottom = region.y + region.height;

                return clickX >= regionLeft && clickX <= regionRight && clickY >= regionTop && clickY <= regionBottom;
            });

            if (clickedRegion) {
                if (!clickedRegions.has(clickedRegion.id)) {
                    setClickedRegions((prev) => new Set([...prev, clickedRegion.id]));
                    onMistakeFound(clickedRegion);

                    // Add click effect
                    const newEffect = {
                        id: Date.now().toString(),
                        x: clickX,
                        y: clickY,
                    };
                    setClickEffects((prev) => [...prev, newEffect]);

                    // Remove effect after animation
                    setTimeout(() => {
                        setClickEffects((prev) => prev.filter((effect) => effect.id !== newEffect.id));
                    }, 1000);

                    message.success('Found a mistake!');
                }
            } else {
                message.error('Try again!');
            }
        },
        [isPlaying, mistakeRegions, clickedRegions, onMistakeFound, scaling],
    );

    return (
        <div className="game-image-container">
            <div
                ref={imageRef}
                className={`absolute-image-container ${isPlaying ? 'playable' : ''}`}
                onClick={handleImageClick}
            >
                {imageUrl && <img src={imageUrl} alt="Spot the Mistake" className="game-image" draggable={false} />}

                {/* Show mistake regions with absolute scaling - only for user page */}
                <AbsoluteScaledRegions
                    regions={mistakeRegions}
                    scaling={scaling}
                    clickedRegions={clickedRegions}
                    showRegions={showRegions}
                />

                {/* Click effects with absolute scaling */}
                <AbsoluteScaledClickEffects effects={clickEffects} scaling={scaling} />
            </div>

            {/* {isPlaying && (
                <div className="game-instructions">
                    <p>Click on the mistake in the image!</p>
                </div>
            )} */}
        </div>
    );
};

export default UserGameImage;
