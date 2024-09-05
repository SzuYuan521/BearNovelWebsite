import React, { useState, useEffect } from "react";
import "../css/adBanner.css";

const images = [
  "/img/banner/banner1.png",
  "/img/banner/banner2.png",
  "/img/banner/banner3.png",
  "/img/banner/banner4.png",
];

const AdBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // 每5秒自動切換圖片

    return () => clearInterval(interval);
  }, []);

  const handlelineClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="ad-banner">
      <img src={images[currentIndex]} alt="廣告" className="banner-image" />
      <div className="banner-lines">
        {images.map((_, index) => (
          <span
            key={index}
            className={`line ${currentIndex === index ? "active" : ""}`}
            onClick={() => handlelineClick(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default AdBanner;
