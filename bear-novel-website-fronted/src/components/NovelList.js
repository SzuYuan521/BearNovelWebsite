import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/novel.css";
import LikeToggle from "./LikeToggle";
import NovelPopular from "./NovelPopular";
import { useDispatch, useSelector } from "react-redux";
import {
  getNovelList,
  updateLikeStatus,
  selectDisplayList,
} from "../redux/slices/novelSlice";

const NovelList = () => {
  const dispatch = useDispatch();
  const novels = useSelector(selectDisplayList);
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);

  useEffect(() => {
    dispatch(getNovelList());
  }, [dispatch]);

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
                <Link to={`/novel-page/${novel.novelId}`}>
                  <div className="novel-left">
                    <img
                      alt="小說封面"
                      src="/img/novel-cover-empty-tip.png"
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
                <NovelPopular
                  likeCount={novel.likeCount}
                  viewCount={novel.viewCount}
                />
                {isLoggedIn && (
                  <LikeToggle
                    novelId={novel.novelId}
                    likeCount={novel.likeCount}
                    onLikeChange={handleLikeChange}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NovelList;
