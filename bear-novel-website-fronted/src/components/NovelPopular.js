import React from "react";

/* 點讚/觀看數組件 */
const NovelPopular = ({ likeCount, viewCount }) => {
  return (
    <div className="novel-popular-left">
      <img src="/img/ui/like-icon.png" alt="點讚數" className="like-icon"></img>
      <p className="like-count">{likeCount}</p>
      <img
        src="/img/ui/view-icon-2.png"
        alt="觀看數"
        className="view-icon"
      ></img>
      <p className="view-count">{viewCount}</p>
    </div>
  );
};

export default NovelPopular;
