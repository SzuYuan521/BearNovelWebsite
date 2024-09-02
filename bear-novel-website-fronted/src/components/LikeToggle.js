import React, { useState, useEffect } from "react";
import { toggleLikeNovel } from "../api/novel-api";

const LikeToggle = ({ novelId, isLiked, likeCount, onLikeChange }) => {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(likeCount);

  useEffect(() => {
    setLiked(isLiked);
    console.log(`目前點讚狀態: ${isLiked}`); // 記錄初始點讚狀態
  }, [isLiked]);

  const handleLike = async () => {
    try {
      await toggleLikeNovel(novelId);
      const newLikedStatus = !liked;
      const newLikeCount = newLikedStatus ? count + 1 : count - 1;

      setLiked(newLikedStatus);
      setCount(newLikeCount);

      console.log(`點讚狀態改變: ${newLikedStatus}`); // 記錄點讚狀態改變
      console.log(`新的點讚數: ${newLikeCount}`); // 記錄新的點讚數

      // 調用 NovelList的回調函數以更新點讚數
      if (onLikeChange) {
        onLikeChange(novelId, newLikedStatus, newLikeCount);
      }
    } catch (error) {
      console.error("點讚錯誤: ", error);
    }
  };

  return (
    <button onClick={handleLike} className="like-button">
      <img
        src={`/img/ui/${liked ? "like-button-on.png" : "like-button-off.png"}`}
        alt={liked ? "已點讚" : "點讚"}
        className="like-toggle"
      />
    </button>
  );
};

export default LikeToggle;
