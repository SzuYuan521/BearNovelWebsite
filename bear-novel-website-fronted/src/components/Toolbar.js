import React from "react";
import { RichUtils } from "draft-js";

const Toolbar = ({ editorState, setEditorState }) => {
  const handleClick = (event, style) => {
    event.preventDefault();
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  return (
    <div className="draft-toolbar">
      <button
        onClick={(event) => handleClick(event, "BOLD")}
        className="draft-toolbar-button"
      >
        <i className="bi bi-type-bold draft-toolbar-icon"></i>
      </button>
      <button
        onClick={(event) => handleClick(event, "ITALIC")}
        className="draft-toolbar-button"
      >
        <i className="bi bi-type-italic draft-toolbar-icon"></i>
      </button>
      <button
        onClick={(event) => handleClick(event, "UNDERLINE")}
        className="draft-toolbar-button"
      >
        <i className="bi bi-type-underline draft-toolbar-icon"></i>
      </button>
    </div>
  );
};

export default Toolbar;
