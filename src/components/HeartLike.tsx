import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LikeTooltip } from './LikeTooltip';

interface HeartLikeProps {
  initialLikes?: number;
  onLike?: () => void;
  messageId: string;
  likedBy?: string[];
}

const HeartLike: React.FC<HeartLikeProps> = ({
  initialLikes = 0,
  onLike,
  messageId,
  likedBy = []
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    setLikes(initialLikes);
    // If AI added likes, show as liked
    if (initialLikes > 0 && !isLiked) {
      setIsLiked(true);
    }
  }, [initialLikes]);

  const handleLike = () => {
    if (!isLiked) {
      setLikes(prev => prev + 1);
      setIsLiked(true);
      onLike?.();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleLike();
  };

  return (
    <StyledWrapper>
      <LikeTooltip likedBy={likedBy}>
        <div className="heart-container" onClick={handleClick}>
          <input
            type="checkbox"
            className="checkbox"
            id={`heart-${messageId}`}
            checked={isLiked}
            readOnly
          />
          <div className="svg-container">
            <svg
              viewBox="0 0 24 24"
              className="svg-outline"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z"></path>
            </svg>
            <svg
              viewBox="0 0 24 24"
              className="svg-filled"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z"></path>
            </svg>
            <svg
              className="svg-celebrate"
              width={100}
              height={100}
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon points="10,10 20,20" />
              <polygon points="10,50 20,50" />
              <polygon points="20,80 30,70" />
              <polygon points="90,10 80,20" />
              <polygon points="90,50 80,50" />
              <polygon points="80,80 70,70" />
            </svg>
          </div>
          {likes > 0 && (
            <div className="like-count">{likes}</div>
          )}
        </div>
      </LikeTooltip>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .heart-container {
    --heart-color: rgb(255, 91, 137);
    position: relative;
    width: 40px;
    height: 40px;
    transition: .3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .heart-container .checkbox {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
    z-index: 20;
    cursor: pointer;
  }

  .heart-container .svg-container {
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  .heart-container .svg-outline,
  .heart-container .svg-filled {
    fill: var(--heart-color);
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .heart-container .svg-outline {
    fill: #9ca3af;
    transition: fill 0.3s;
  }

  .heart-container:hover .svg-outline {
    fill: var(--heart-color);
  }

  .heart-container .svg-filled {
    animation: keyframes-svg-filled 1s;
    display: none;
  }

  .heart-container .svg-celebrate {
    position: absolute;
    animation: keyframes-svg-celebrate .5s;
    animation-fill-mode: forwards;
    display: none;
    stroke: var(--heart-color);
    fill: var(--heart-color);
    stroke-width: 2px;
  }

  .heart-container .checkbox:checked ~ .svg-container .svg-filled {
    display: block;
  }

  .heart-container .checkbox:checked ~ .svg-container .svg-celebrate {
    display: block;
  }

  .heart-container .checkbox:checked ~ .svg-container .svg-outline {
    display: none;
  }

  .like-count {
    position: absolute;
    bottom: -8px;
    right: -4px;
    background: var(--heart-color);
    color: white;
    font-size: 10px;
    font-weight: bold;
    padding: 2px 5px;
    border-radius: 10px;
    min-width: 18px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    animation: pop-in 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  }

  @keyframes pop-in {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes keyframes-svg-filled {
    0% {
      transform: scale(0);
    }
    25% {
      transform: scale(1.2);
    }
    50% {
      transform: scale(1);
      filter: brightness(1.5);
    }
  }

  @keyframes keyframes-svg-celebrate {
    0% {
      transform: scale(0);
    }
    50% {
      opacity: 1;
      filter: brightness(1.5);
    }
    100% {
      transform: scale(1.4);
      opacity: 0;
      display: none;
    }
  }
`;

export default HeartLike;
