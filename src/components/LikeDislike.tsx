import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface LikeDislikeProps {
  initialLikes?: number;
  initialDislikes?: number;
  onLike?: () => void;
  onDislike?: () => void;
  messageId: string;
}

const LikeDislike: React.FC<LikeDislikeProps> = ({ 
  initialLikes = 0, 
  initialDislikes = 0,
  onLike,
  onDislike,
  messageId 
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);

  useEffect(() => {
    setLikes(initialLikes);
    setDislikes(initialDislikes);
    // If AI added likes and user hasn't voted, show likes
    if (initialLikes > 0 && !userVote) {
      setUserVote('like');
    }
  }, [initialLikes, initialDislikes]);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (userVote === 'like') return; // Already liked
    
    if (userVote === 'dislike') {
      setDislikes(prev => Math.max(0, prev - 1));
    }
    
    setLikes(prev => prev + 1);
    setUserVote('like');
    onLike?.();
  };

  const handleDislike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (userVote === 'dislike') return; // Already disliked
    
    if (userVote === 'like') {
      setLikes(prev => Math.max(0, prev - 1));
    }
    
    setDislikes(prev => prev + 1);
    setUserVote('dislike');
    onDislike?.();
  };

  // Format numbers to show up to 999
  const formatCount = (count: number): string[] => {
    const str = Math.min(count, 999).toString().padStart(3, '0');
    return str.split('');
  };

  const likeDigits = formatCount(likes);
  const dislikeDigits = formatCount(dislikes);

  return (
    <StyledWrapper>
      <div className="container">
        <label htmlFor={`dislike-${messageId}`} onClick={handleDislike} style={{ cursor: 'pointer' }}>
          <input 
            type="radio" 
            name={`evaluation-${messageId}`} 
            id={`dislike-${messageId}`}
            checked={userVote === 'dislike'}
            onChange={(e) => handleDislike(e as any)}
            style={{ pointerEvents: 'none' }}
          />
          <svg className="icon dislike" xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24">
            <path d="M20 3H6.693A2.01 2.01 0 0 0 4.82 4.298l-2.757 7.351A1 1 0 0 0 2 12v2c0 1.103.897 2 2 2h5.612L8.49 19.367a2.004 2.004 0 0 0 .274 1.802c.376.52.982.831 1.624.831H12c.297 0 .578-.132.769-.36l4.7-5.64H20c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zm-8.469 17h-1.145l1.562-4.684A1 1 0 0 0 11 14H4v-1.819L6.693 5H16v9.638L11.531 20zM18 14V5h2l.001 9H18z" />
          </svg>
        </label>
        <div className="count">
          {userVote === 'like' ? (
            <>
              {likeDigits.map((digit, idx) => (
                <div key={idx} className="number" data-value={digit}>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <span key={num}>{num}</span>
                  ))}
                </div>
              ))}
            </>
          ) : (
            <>
              {dislikeDigits.map((digit, idx) => (
                <div key={idx} className="number" data-value={digit}>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <span key={num}>{num}</span>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
        <label htmlFor={`like-${messageId}`} onClick={handleLike} style={{ cursor: 'pointer' }}>
          <input 
            type="radio" 
            name={`evaluation-${messageId}`} 
            id={`like-${messageId}`}
            checked={userVote === 'like'}
            onChange={(e) => handleLike(e as any)}
            style={{ pointerEvents: 'none' }}
          />
          <svg className="icon like" xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24">
            <path d="M20 8h-5.612l1.123-3.367c.202-.608.1-1.282-.275-1.802S14.253 2 13.612 2H12c-.297 0-.578.132-.769.36L6.531 8H4c-1.103 0-2 .897-2 2v9c0 1.103.897 2 2 2h13.307a2.01 2.01 0 0 0 1.873-1.298l2.757-7.351A1 1 0 0 0 22 12v-2c0-1.103-.897-2-2-2zM4 10h2v9H4v-9zm16 1.819L17.307 19H8V9.362L12.468 4h1.146l-1.562 4.683A.998.998 0 0 0 13 10h7v1.819z" />
          </svg>
        </label>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .container {
    --col-gray: #d1d5db;
    --col-white: #374151;
    --col-like: #2563eb;
    --col-dislike: #dc2626;
    --transition: 350ms;
    background-color: var(--col-gray);
    width: 90px;
    border-radius: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px;
    user-select: none;
    transform: scale(1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    --zero: translateY(calc(50% - 9px));
    --one: translateY(calc(40% - 9px));
    --two: translateY(calc(30% - 9px));
    --three: translateY(calc(20% - 9px));
    --four: translateY(calc(10% - 9px));
    --five: translateY(calc(0% - 9px));
    --six: translateY(calc(-10% - 9px));
    --seven: translateY(calc(-20% - 9px));
    --eight: translateY(calc(-30% - 9px));
    --nine: translateY(calc(-40% - 9px));
  }

  .container:has(input[id*="like"]:checked) .count {
    border-left-color: var(--col-like);
    border-right-color: transparent;
  }

  .container:has(input[id*="like"]:checked) .count .number:first-child {
    transform: var(--one);
  }

  .container:has(input[id*="like"]:checked) .count .number:nth-child(2) {
    transform: var(--zero);
  }

  .container:has(input[id*="like"]:checked) .count .number:last-child {
    transform: var(--two);
  }

  .container:has(input[id*="dislike"]:checked) > .count {
    border-right-color: var(--col-dislike);
    border-left-color: transparent;
  }

  .container:has(input[id*="dislike"]:checked) > .count .number:first-child {
    transform: var(--three);
  }

  .container:has(input[id*="dislike"]:checked) > .count .number:nth-child(2) {
    transform: var(--four);
  }

  .container:has(input[id*="dislike"]:checked) > .count .number:last-child {
    transform: var(--five);
  }

  .container label input {
    display: none;
  }

  .container input[id*="like"]:checked + svg {
    animation: evaluation-animation var(--transition) ease-in-out 0s 1 normal both;
    fill: var(--col-like);
  }

  .container input[id*="dislike"]:checked + svg {
    animation: evaluation-animation var(--transition) ease-in-out 0s 1 normal both;
    fill: var(--col-dislike);
  }

  .container .icon {
    cursor: pointer;
    fill: var(--col-white);
    height: 16px;
    width: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: fill var(--transition);
  }

  .container .icon.like {
    margin-left: 8px;
  }

  .container .icon.dislike {
    margin-right: 8px;
  }

  .container .count {
    transition: var(--transition);
    flex: 1;
    border-left: 1px solid var(--col-white);
    border-right: 1px solid var(--col-white);
    position: relative;
    height: 24px;
    overflow: hidden;
    margin: auto 4px;
    color: white;
    font-size: 16px;
    font-family: sans-serif;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1px;
    flex-direction: row;
    min-width: 30px;
  }

  .container .count .number {
    display: flex;
    flex-direction: column;
    transition: 1000ms cubic-bezier(0.68, -0.55, 0.27, 1.55);
  }

  .container .count .number[data-value="0"] { transform: var(--zero); }
  .container .count .number[data-value="1"] { transform: var(--one); }
  .container .count .number[data-value="2"] { transform: var(--two); }
  .container .count .number[data-value="3"] { transform: var(--three); }
  .container .count .number[data-value="4"] { transform: var(--four); }
  .container .count .number[data-value="5"] { transform: var(--five); }
  .container .count .number[data-value="6"] { transform: var(--six); }
  .container .count .number[data-value="7"] { transform: var(--seven); }
  .container .count .number[data-value="8"] { transform: var(--eight); }
  .container .count .number[data-value="9"] { transform: var(--nine); }

  .container .count .number:first-child {
    transition-delay: 200ms;
  }

  .container .count .number:nth-child(2) {
    transition-delay: 150ms;
  }

  .container .count .number:last-child {
    transition-delay: 50ms;
  }

  @keyframes evaluation-animation {
    0%,
    100% {
      transform: scale(1) rotate(0deg);
    }
    50% {
      transform: scale(1.2) rotate(-10deg);
    }
  }
`;

export default LikeDislike;
