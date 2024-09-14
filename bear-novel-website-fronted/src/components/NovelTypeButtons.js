import React from "react";
import "../css/novel.css";

const novelTypes = [
  { label: "全部", value: -1 }, // All
  { label: "戀愛言情", value: 0 }, // Romance
  { label: "古代", value: 1 }, // Ancient
  { label: "末日", value: 2 }, // Doomsday
  { label: "科幻", value: 3 }, // ScienceFiction
  { label: "校園", value: 4 }, // Campus
  { label: "武俠修仙", value: 5 }, // MartialArts
  { label: "系統", value: 6 }, // System
  { label: "豪門", value: 7 }, // RichFamily
  { label: "穿越", value: 8 }, // TimeTravel
  { label: "重生", value: 9 }, // Rebirth
  { label: "懸疑", value: 10 }, // Suspense
  { label: "靈異", value: 11 }, // Supernatural
  { label: "架空", value: 12 }, // Imaginary
  { label: "搞笑", value: 13 }, // Funny
  { label: "網遊競技", value: 14 }, // OnlineGames
  { label: "男同性戀", value: 15 }, // BL
  { label: "女同性戀", value: 16 }, // Lesbian
  { label: "萌寶", value: 17 }, // CuteBaby
];

const NovelTypeButtons = ({ novelType, onTypeChange }) => {
  return (
    <div className="d-flex align-items-start">
      <div className="novel-type-title d-flex align-items-center">
        <p>分類:</p>
      </div>
      <div className="novel-type-button-container d-flex justify-content-start gap-3">
        {novelTypes.map((type, index) => (
          <button
            key={index}
            className={`novel-type-button ${
              novelType === type.value ? "active" : ""
            }`}
            onClick={() => onTypeChange(type.value)}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NovelTypeButtons;
