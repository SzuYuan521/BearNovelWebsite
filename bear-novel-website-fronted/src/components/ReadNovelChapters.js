import React, { useState, useCallback, useEffect, useRef } from "react";
import { GetChapterList, GetChapterContext } from "../api/novel-api";
import { Button } from "react-bootstrap";
import { convertFromRaw } from "draft-js";
import { Link, useLocation } from "react-router-dom";

const ReadNovelChapters = () => {
  // 取得當前路徑中的查詢參數, 用於獲取小說 ID 和章節 ID
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const novelId = searchParams.get("novelId"); // 從 URL 取得 novelId 參數
  const initialChapterId = searchParams.get("chapterId"); // 從 URL 取得 chapterId 參數

  // 初始化 state 變數來儲存章節列表、當前章節、頁碼、載入狀態等
  const [chapters, setChapters] = useState([]); // 儲存小說章節列表
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0); // 當前章節index
  const [page, setPage] = useState(1); // 當前頁數
  const [loading, setLoading] = useState(true); // 整體載入狀態
  const [chapterLoading, setChapterLoading] = useState(true); // 單一章節載入狀態
  const [hasNextPage, setHasNextPage] = useState(true); // 是否有下一頁章節
  const [chapterContent, setChapterContent] = useState(""); // 當前章節內容
  const loadedPagesRef = useRef(new Set()); // 儲存已載入的頁數, 避免重複請求
  const initialLoadDoneRef = useRef(false); // 跟蹤初始加載是否完成

  // 從location.state中取得novelTitle
  const novelTitle = location.state?.novelTitle || "";

  // 載入章節列表, 支援分頁(10個一頁)與章節目標查找
  const loadChapters = useCallback(
    async (pageToLoad, targetChapterId = null) => {
      // 確保將 targetChapterId 轉換為整數
      const targetId = targetChapterId ? parseInt(targetChapterId, 10) : null;

      // 如果當前頁面已載入且無需特定章節, 則跳過
      if (loadedPagesRef.current.has(pageToLoad) && !targetId) return;

      setLoading(true); // 開啟載入狀態
      try {
        const newChapters = await GetChapterList(novelId, pageToLoad);
        // 更新章節列表
        setChapters((prevChapters) => {
          const updatedChapters =
            pageToLoad === 1 ? newChapters : [...prevChapters, ...newChapters];
          return updatedChapters;
        });
        setHasNextPage(newChapters.length === 10); // 判斷是否有下一頁
        loadedPagesRef.current.add(pageToLoad); // 標記該頁面已載入

        // 如果目標章節存在, 尋找該章節並設定index
        if (targetId) {
          const targetIndex = newChapters.findIndex(
            (chapter) => chapter.chapterId === targetId
          );
          if (targetIndex !== -1) {
            setCurrentChapterIndex((pageToLoad - 1) * 10 + targetIndex); // 設定當前章節index
            return true; // 找到目標章節
          } else if (newChapters.length === 10) {
            return await loadChapters(pageToLoad + 1, targetId); // 如果未找到目標章節, 載入下一頁
          }
        }
        console.log("3");
        return false; // 未找到目標章節
      } catch (error) {
        console.error("載入章節列表時出錯:", error);
        return false;
      } finally {
        setLoading(false); // 關閉載入狀態
      }
    },
    [novelId]
  );

  // 載入指定章節的內容
  const loadChapterContent = useCallback(
    async (chapterId) => {
      setChapterLoading(true); // 開啟章節內容載入狀態
      try {
        // 從 API 獲取章節內容
        const response = await GetChapterContext(novelId, chapterId);
        const contentState = convertFromRaw(JSON.parse(response.content)); // 將內容轉換為 Draft.js 的格式
        const plainText = contentState.getPlainText(); // 轉換為純文字
        setChapterContent(plainText); // 更新章節內容
      } catch (error) {
        console.error("載入章節內容時出錯:", error);
      } finally {
        setChapterLoading(false); // 關閉章節內容載入狀態
      }
    },
    [novelId]
  );

  // 這個 useEffect 負責在組件初始化時載入初始章節列表和初始章節內容
  useEffect(() => {
    const loadInitialChapter = async () => {
      if (initialChapterId) {
        // 如果 URL 中提供了初始章節 ID, 載入該章節
        const found = await loadChapters(1, initialChapterId);
        if (!found) {
          // 如果未找到指定的章節, 顯示第一章
          console.warn("未找到指定的初始章節，顯示第一章");
          setCurrentChapterIndex(0); // 設定當前章節為第一章
        }
      } else {
        // 如果未指定章節 ID, 則預設載入第一頁並設置第一章為當前章節
        await loadChapters(1);
        setCurrentChapterIndex(0);
      }
      // 標記初始加載已完成，避免重複加載
      initialLoadDoneRef.current = true;
    };

    // 僅在初始加載未完成時執行
    if (!initialLoadDoneRef.current) {
      loadInitialChapter();
    }
  }, [loadChapters, initialChapterId]); // 當 loadChapters 函數或 initialChapterId 發生變化時重新執行

  // 這個 useEffect 負責在當前章節或章節列表變更時載入章節內容
  useEffect(() => {
    // 確保初始加載已完成且當前章節 index 不為 null 且章節列表有內容
    if (
      initialLoadDoneRef.current &&
      currentChapterIndex !== null &&
      chapters.length > 0
    ) {
      // 獲取當前章節
      const chapter = chapters[currentChapterIndex];
      // 載入當前章節內容
      loadChapterContent(chapter.chapterId);

      // 根據當前章節 index 計算頁數, 因為每頁顯示 10 章節
      const currentPage = Math.floor(currentChapterIndex / 10) + 1;
      if (currentPage > page) {
        // 如果當前頁數比 state 中的頁數大, 更新頁數
        setPage(currentPage);
      }

      // 如果當前章節是最後一個且還有下一頁, 載入下一頁的章節列表
      if (currentChapterIndex === chapters.length - 1 && hasNextPage) {
        loadChapters(page + 1);
      }
    }
  }, [
    chapters, // 依賴章節列表變更
    currentChapterIndex, // 依賴當前章節 index 變更
    loadChapterContent, // 依賴載入章節內容的函數
    hasNextPage, // 依賴是否有下一頁的標誌
    page, // 依賴當前頁數
    loadChapters, // 依賴載入章節列表的函數
  ]);

  // 處理 下一章 按鈕的點擊事件
  const handleNextChapter = useCallback(() => {
    setCurrentChapterIndex((prevIndex) => prevIndex + 1); // 將當前章節將當前章節 index + 1
    scrollToTop();
  }, []);

  // 處理 上一章 按鈕的點擊事件
  const handlePreviousChapter = useCallback(() => {
    setCurrentChapterIndex((prevIndex) => prevIndex - 1); // 將當前章節 index - 1
    scrollToTop();
  }, []);

  // 滾動到頁面頂部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 判斷當前章節是否是最後一章和第一章
  const currentChapter = chapters[currentChapterIndex];
  const isLastChapter =
    !hasNextPage && currentChapterIndex === chapters.length - 1;
  const isFirstChapter = currentChapterIndex === 0;

  // 如果正在載入章節列表且尚未有章節資料, 顯示載入訊息
  if (loading && chapters.length === 0) {
    return <div>正在載入章節列表...</div>;
  }

  return (
    <div className="p-3 mt-3">
      <Link to={`/novel-page/${novelId}`} className="novel-link">
        <i className="bi bi-chevron-left return-novel-page">
          {novelTitle ? novelTitle : "返回"}
        </i>
      </Link>
      {currentChapter && (
        <h2 className="mt-5">
          第 {currentChapter.chapterNumber} 章 {currentChapter.title}
        </h2>
      )}
      <div className="novel-page-horizontal-divider mt-4 mb-4"></div>
      {chapterLoading ? (
        <div>正在載入章節內容...</div>
      ) : (
        <>
          <div
            style={{ minHeight: "calc(100vh - 150px)", whiteSpace: "pre-wrap" }}
          >
            {chapterContent}
          </div>
          {isLastChapter && <h4 className="p-3 mt-5">已經是最新一章</h4>}
          <div className="d-flex justify-content-center gap-3 mt-5 mb-5">
            {!isFirstChapter && (
              <Button
                onClick={handlePreviousChapter}
                className="novel-page-info-button w-100"
              >
                上一章
              </Button>
            )}
            {!isLastChapter && (
              <Button
                onClick={handleNextChapter}
                className="novel-page-info-button w-100"
              >
                下一章
              </Button>
            )}
          </div>
        </>
      )}
      {loading && <div>正在載入更多章節...</div>}
    </div>
  );
};

export default ReadNovelChapters;
