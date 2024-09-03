import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/novel.css";
import LikeToggle from "./LikeToggle";
import { useDispatch, useSelector } from "react-redux";
import { getNovelList, updateLikeStatus } from "../redux/slices/novelSlice";

const NovelList = () => {
  const dispatch = useDispatch();
  const novels = useSelector((state) => state.novels.list);
  const novelStatus = useSelector((state) => state.novels.status);

  useEffect(() => {
    if (novelStatus === "idle") {
      dispatch(getNovelList());
    }
  }, [dispatch, novelStatus]);

  const handleLikeChange = (novelId, newLikedStatus, newLikeCount) => {
    dispatch(
      updateLikeStatus({
        novelId,
        isLiked: newLikedStatus,
        likeCount: newLikeCount,
      })
    );
  };

  return (
    <div className="container my-4">
      <div className="row g-4">
        {novels.map((novel) => (
          <div key={novel.novelId} className="col-12 col-md-6 col-lg-4">
            <div className="novel-grid rounded p-3 text-center">
              <div className="novel-info">
                <Link to={`/novels/${novel.novelId}`}>
                  <div className="novel-left">
                    <img
                      alt="小說封面"
                      src="/img/這道長能處算命就送女朋友.jfif"
                      className="novel-image"
                    ></img>
                  </div>
                </Link>
                <div className="novel-right">
                  <Link to={`/novels/${novel.novelId}`} className="novel-link">
                    <h5 className="novel-title">{novel.title}</h5>
                  </Link>
                  <div className="novel-sub-Info-right">
                    <p className="novel-author">
                      作者: {novel.user?.nickName || "未知"}
                    </p>
                    <div className="novel-sub-Info-right">
                      <img
                        src="/img/ui/book-icon.png"
                        alt=""
                        className="serialized-icon"
                      ></img>
                      <p className="novel-serialized">
                        {novel.isEnding ? "已完結" : "連載中"}
                      </p>
                    </div>
                  </div>
                  <p className="novel-description">{novel.description}</p>
                </div>
              </div>
              <div className="novel-popular">
                <div className="novel-popular-left">
                  <img
                    src="/img/ui/like-icon.png"
                    alt="點讚數"
                    className="like-icon"
                  ></img>
                  <p className="like-count">{novel.likeCount}</p>
                  <img
                    src="/img/ui/view-icon-2.png"
                    alt="觀看數"
                    className="view-icon"
                  ></img>
                  <p className="view-count">{novel.viewCount}</p>
                </div>
                <LikeToggle
                  novelId={novel.novelId}
                  likeCount={novel.likeCount}
                  onLikeChange={handleLikeChange}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NovelList;
