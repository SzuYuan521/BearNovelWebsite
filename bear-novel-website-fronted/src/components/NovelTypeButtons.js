import React from "react";
import { novelTypeArray } from "../redux/slices/novelSlice";
import "../css/novel.css";

const NovelTypeButtons = ({ novelType, onTypeChange }) => {
  return (
    <div className="d-flex align-items-start">
      <div className="novel-type-title d-flex align-items-center">
        <p>分類:</p>
      </div>
      <div className="novel-type-button-container d-flex justify-content-start gap-3">
        {novelTypeArray.map((type, index) => (
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
