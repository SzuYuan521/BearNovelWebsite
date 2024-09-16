import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import {
  getNovelByNovelId,
  selectCurrentNovel,
  selectCurrentNovelChapters,
  novelTypeArray,
} from "../redux/slices/novelSlice";
import { Button } from "react-bootstrap";
import NovelPopular from "./NovelPopular";
import { format } from "date-fns";
import ProfilePicture from "./ProfilePicture";

const NovelPage = () => {
  const { novelId } = useParams();
  const dispatch = useDispatch();
  const novel = useSelector(selectCurrentNovel);
  const chapters = useSelector(selectCurrentNovelChapters);

  useEffect(() => {
    dispatch(getNovelByNovelId(novelId));
  }, [dispatch, novelId]);

  if (!novel) {
    return <div>Loading...</div>;
  }

  const lastChapter =
    chapters.length > 0 ? chapters[chapters.length - 1] : null;
  const lastUpdateDate = lastChapter
    ? format(new Date(lastChapter.updatedAt), "yyyy-MM-dd HH:mm:ss")
    : "";

  return (
    <div>
      <div className="novel-page-info-container">
        <div className="novel-page-info mt-5">
          <img
            alt="小說封面"
            src="/img/novel-cover-empty-tip.png"
            className="novel-page-info-left"
          ></img>
          <div className="novel-page-info-right">
            <p className="novel-page-info-title">{novel.title}</p>
            {novel.novelTypes.length > 0 && (
              <div className="d-flex flex-wrap gap-2 mb-3">
                <p className="novel-page-info-isEnding">
                  {novel.isEnding ? "已完結" : "連載中"}
                </p>
                {novel.novelTypes.map((novelType) => {
                  const type = novelTypeArray.find(
                    (type) => type.value === novelType
                  );
                  return type ? (
                    <p className="novel-page-info-tag" key={type.value}>
                      {type.label}
                    </p>
                  ) : null;
                })}
              </div>
            )}
            <div className="mt-3 mb-3">
              <span className="novel-page-info-word-count">
                {novel.totalWordCount >= 10000
                  ? novel.totalWordCount / 10000
                  : novel.totalWordCount}
              </span>
              &nbsp;
              <span className="novel-page-info-word-count-unit">
                {novel.totalWordCount >= 10000 ? "萬字" : "字"}
              </span>
            </div>
            <NovelPopular
              likeCount={novel.likeCount}
              viewCount={novel.viewCount}
            />
            {lastChapter && (
              <p className="novel-page-info-last-updated mt-3 mb-0">
                更新至&nbsp;第{lastChapter.chapterNumber}章&nbsp;
                {lastChapter.title}
                &nbsp;&nbsp;{lastUpdateDate}
              </p>
            )}
            <Button className="novel-page-info-button">開始閱讀</Button>
          </div>
          <div className="novel-page-straight-divider"></div>
          <div className="novel-page-author-info">
            <ProfilePicture
              profilePicture={novel.user.profilePicture}
              size={80}
            />
            <p className="novel-page-author-name">{novel.user.nickName}</p>
          </div>
        </div>
      </div>
      <div className="novel-page-container mt-5 p-3 bg-light">
        <p className="novel-page-big-title">作品簡介</p>
        <div className="novel-page-horizontal-divider"></div>
        <p className="novel-page-description">{novel.description}</p>
        <p className="novel-page-big-title">作品目錄 {chapters.length}章</p>
        <div className="novel-page-horizontal-divider"></div>
        <div className="row mt-3">
          {chapters.map((chapter) => (
            <div
              className="col-12 col-sm-6 col-md-4 mb-3"
              key={chapter.chapterId}
            >
              <Link
                to="/novel-page/:novelId/chapter/:chapterId"
                className="novel-page-chapters-link p-2"
              >
                第{chapter.chapterNumber}章 {chapter.title}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NovelPage;
