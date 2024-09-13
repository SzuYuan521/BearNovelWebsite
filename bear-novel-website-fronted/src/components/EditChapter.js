import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Editor,
  EditorState,
  ContentState,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";
import { updateChapter } from "../api/novel-api";
import Toolbar from "./Toolbar";
import "../css/custom-draft.css";

const EditChapter = () => {
  const [title, setTitle] = useState("");
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const navigate = useNavigate();
  const location = useLocation();
  const { novelId, chapterId } = useParams();

  useEffect(() => {
    const chapter = location.state?.chapter;
    if (chapter) {
      setTitle(chapter.title || "");

      // 將保存的內容轉換為 Draft.js 的 ContentState
      let contentState;
      if (chapter.content) {
        try {
          const rawContent = JSON.parse(chapter.content);
          contentState = convertFromRaw(rawContent);
        } catch (error) {
          // 如果解析失敗, 假設內容是純文本
          contentState = ContentState.createFromText(chapter.content);
        }
      } else {
        contentState = ContentState.createFromText("");
      }

      setEditorState(EditorState.createWithContent(contentState));
    }
  }, [location.state]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const contentRaw = convertToRaw(editorState.getCurrentContent());
    const chapterData = {
      title,
      content: JSON.stringify(contentRaw),
    };

    try {
      await updateChapter(chapterId, chapterData);
      navigate(`/novel/my-novels/${novelId}`); // 導航回小說列表頁
    } catch (error) {
      console.error("操作失敗: ", error);
    }
  };

  return (
    <div className="draft-form">
      <h2>編輯章節</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">標題</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <Toolbar editorState={editorState} setEditorState={setEditorState} />
          <div className="draft-form-editor">
            <Editor editorState={editorState} onChange={setEditorState} />
          </div>
        </div>
        <div className="submit-container">
          <button type="submit" className="modal-btn-primary">
            更新章節
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditChapter;
