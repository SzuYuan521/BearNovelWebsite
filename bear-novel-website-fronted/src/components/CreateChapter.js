import React, { useState } from "react";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import { addChapter } from "../redux/slices/novelSlice";
import "../css/modal.css";

Modal.setAppElement("#root");

const CreateChapter = ({
  novelId,
  isOpen,
  onRequestClose,
  refreshChapters,
}) => {
  const dispatch = useDispatch();
  const addChapterStatus = useSelector(
    (state) => state.novels.addChapterStatus
  );
  const [chapterName, setChapterName] = useState("");

  const handleSubmit = (e) => {
    // 防止表單刷新頁面
    e.preventDefault();

    const chapter = {
      Title: chapterName,
    };

    dispatch(addChapter({ id: novelId, chapter }))
      .unwrap()
      .then(() => {
        alert("章節新增成功!");
        setChapterName(""); // 清空作品名稱輸入框
        refreshChapters();
        onRequestClose(); // 關閉 modal
      })
      .catch((error) => {
        alert("新增章節失敗!請刷新頁面或是檢查連線");
      });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="modal-content"
      overlayClassName="modal-overlay"
      contentLabel="Modal"
    >
      <div className="modal-header">
        <h2>新增章節</h2>
      </div>
      <div className="modal-body">
        <div className="container mb-4">
          <h3 className="text-start">章節名稱</h3>
          <input
            type="text"
            className="novel-name-input mt-3"
            placeholder="請輸入章節名稱"
            value={chapterName}
            onChange={(e) => setChapterName(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="btn modal-btn-primary mt-4"
          onClick={handleSubmit}
          disabled={addChapterStatus === "loading"}
        >
          {addChapterStatus === "loading" ? "新增中..." : "確定"}
        </button>
      </div>
    </Modal>
  );
};

export default CreateChapter;
