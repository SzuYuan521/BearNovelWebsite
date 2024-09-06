import React, { useState, useRef } from "react";
import { uploadProfilePicture } from "../api/user-api";
import { useModal } from "../contexts/ModalContext";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 設定文件大小限制為 2MB

const UploadProfilePicture = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);
  const { openModal } = useModal();

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        openModal("上傳錯誤", "文件大小超過 2MB，請選擇較小的文件。", () => {});
        setSelectedFile(null); // 清除已選擇的文件
        setFileName("");
      } else {
        setSelectedFile(file);
        setFileName(file.name);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert("Please select a picture to upload");
      return;
    }

    try {
      const response = await uploadProfilePicture(selectedFile);
      if (response.status === 200) {
        alert("大頭照上傳成功");
      } else {
        alert("大頭照上傳失敗");
      }
    } catch (error) {
      alert("大頭照上傳失敗");
      throw error;
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <button
        type="button"
        className="custom-file-button me-2"
        onClick={handleClick}
      >
        <i className="bi-file-earmark-plus"> </i>
        {fileName || "選擇照片"}
      </button>
      <input
        type="file"
        name="profilePicture"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: "none" }} // 隱藏原始按鈕
      />
      <button type="submit" className="submit-button">
        <i className="bi-upload"> </i>
        上傳照片
      </button>
    </form>
  );
};

export default UploadProfilePicture;
