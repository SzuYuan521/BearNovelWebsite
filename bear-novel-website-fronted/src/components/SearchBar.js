import React, { useState } from "react";
import { getNovelsByTitleKeyWords } from "../api/novel-api";
import "../css/global.css";

const SearchBar = () => {
  const [keywords, setKeywords] = useState("");

  const handleSearch = async () => {
    try {
      if (keywords.trim() === "") return; // 避免搜尋空字串
      const novels = await getNovelsByTitleKeyWords(keywords);
      console.log("搜尋結果:", novels);
      // 之後做一個額外的顯示小說頁面(有顯示搜尋框的)
    } catch (error) {
      console.error("搜尋小說失敗", error);
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-input"
        placeholder="請輸入書名/作者"
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      />
      <button className="search-button" onClick={handleSearch}>
        <img src="/img/ui/search-button.png" alt="搜尋" />
      </button>
    </div>
  );
};

export default SearchBar;
