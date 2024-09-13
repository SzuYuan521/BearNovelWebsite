import React, { useState } from "react";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import { addNovel } from "../redux/slices/novelSlice";
import "../css/modal.css";

Modal.setAppElement("#root");

const CreateNovel = ({ isOpen, onRequestClose }) => {
  const novelType = [
    "Romance",
    "Ancient",
    "Doomsday",
    "ScienceFiction",
    "Campus",
    "MartialArts",
    "System",
    "RichFamily",
    "TimeTravel",
    "Rebirth",
    "Suspense",
    "Supernatural",
    "Imaginary",
    "Funny",
    "OnlineGames",
    "BL",
    "Lesbian",
    "CuteBaby",
  ];
  const novelTypeString = [
    "戀愛言情",
    "古代",
    "末日",
    "科幻",
    "校園",
    "武俠修仙",
    "系統",
    "豪門",
    "穿越",
    "重生",
    "懸疑",
    "靈異",
    "架空",
    "搞笑",
    "網遊競技",
    "男同性戀",
    "女同性戀",
    "萌寶",
  ];

  const dispatch = useDispatch();
  const addNovelStatus = useSelector((state) => state.novels.addNovelStatus);

  const [novelName, setNovelName] = useState("");
  const [checkedItems, setCheckedItems] = useState([]);

  const maxSelection = 4; // 最多勾選數量
  const minSelection = 1; // 最少勾選數量

  const handleCheckboxChange = (event) => {
    const { id, checked } = event.target;
    if (checked) {
      setCheckedItems((prev) => [...prev, id]);
    } else {
      setCheckedItems((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleSubmit = (e) => {
    // 防止表單刷新頁面
    e.preventDefault();

    // 檢查選擇的類別是否符合要求
    if (
      checkedItems.length < minSelection ||
      checkedItems.length > maxSelection
    ) {
      alert(`請勾選${minSelection}-${maxSelection}個類別`);
      return;
    }

    const novel = {
      Title: novelName,
      NovelTypes: checkedItems,
    };

    dispatch(addNovel(novel))
      .unwrap()
      .then(() => {
        alert("小說新增成功!");
        setNovelName(""); // 清空作品名稱輸入框
        setCheckedItems([]); // 清空選擇項目
        onRequestClose(); // 關閉 modal
      })
      .catch((error) => {
        alert("新增小說失敗!請刷新頁面或是檢查連線");
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
        <h2>新增作品</h2>
      </div>
      <div className="modal-body">
        <div className="container mb-4">
          <h3 className="text-start">作品名稱</h3>
          <input
            type="text"
            className="novel-name-input mt-3"
            placeholder="請輸入作品名稱"
            value={novelName}
            onChange={(e) => setNovelName(e.target.value)}
          />
        </div>
        <div className="container mt-4">
          <h3 className="text-start">作品類別</h3>
          <p className="custom-pink-text text-start">
            至少勾選{minSelection}個類別，最多勾選{maxSelection}個類別
          </p>
          <form onSubmit={handleSubmit}>
            <div className="custom-checkbox-grid custom-container">
              {novelType.map((type, index) => (
                <div className="custom-form-check" key={type}>
                  <input
                    type="checkbox"
                    id={type}
                    className="custom-checkbox"
                    checked={checkedItems.includes(type)}
                    onChange={handleCheckboxChange}
                    disabled={
                      checkedItems.length >= maxSelection &&
                      !checkedItems.includes(type)
                    }
                  />
                  <label htmlFor={type}>{novelTypeString[index]}</label>
                </div>
              ))}
            </div>
            <button
              type="submit"
              className="btn modal-btn-primary mt-4"
              disabled={
                checkedItems.length < minSelection ||
                addNovelStatus === "loading"
              }
            >
              {addNovelStatus === "loading" ? "新增中..." : "確定"}
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default CreateNovel;
