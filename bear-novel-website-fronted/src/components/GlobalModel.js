import React from "react";
import Modal from "react-modal";
import "../css/modal.css";

// 設置 modal 的根元素
Modal.setAppElement("#root");

const GlobalModel = ({
  isOpen,
  onRequestClose,
  title,
  context,
  onButtonClick,
}) => {
  const handleClick = () => {
    // 如果 onButtonClick 存在則執行它，否則僅關閉 Modal
    if (onButtonClick) {
      onButtonClick();
    } else {
      onRequestClose();
    }
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
        <h2>{title}</h2>
      </div>
      <div className="modal-body">
        <p>{context}</p>
      </div>
      <div className="modal-footer">
        <button onClick={handleClick} className="modal-btn-primary">
          確認
        </button>
      </div>
    </Modal>
  );
};

export default GlobalModel;
