import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleLike,
  setLikeStatus,
  setLikeCount,
} from "../redux/slices/likeSlice";

const LikeToggle = ({ novelId, likeCount, onLikeChange }) => {
  // 設置本地狀態 count, 初始值是傳入的likeCount
  const [count, setCount] = useState(likeCount);

  // 獲取 Redux 的 dispatch 函數, 用來發送 action
  const dispatch = useDispatch();

  // 從 Redux store 中獲取當前小說是否被點讚的狀態
  const liked = useSelector(
    (state) => state.likes.likedNovels[novelId] || false
  );

  // 處理點讚或取消點讚的函數
  const handleLike = async () => {
    try {
      // 發送非同步 action, 觸發 API 請求, 並更新 Redux store
      await dispatch(toggleLike(novelId));

      // 更新點讚狀態跟點讚數
      const newLikedStatus = !liked;
      const newLikeCount = newLikedStatus ? count + 1 : count - 1;

      // 更新本地狀態中的點讚數
      setCount(newLikeCount);

      // 更新 Redux store 中的點讚狀態
      dispatch(setLikeStatus({ novelId, isLiked: newLikedStatus }));
      dispatch(setLikeCount({ novelId, likeCount: newLikeCount }));

      console.log(`點讚狀態改變: ${newLikedStatus}`); // 記錄點讚狀態改變
      console.log(`新的點讚數: ${newLikeCount}`); // 記錄新的點讚數

      // 調用回調函數以更新外部點讚數
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
