import "bootstrap/dist/css/bootstrap.min.css"; // 引入 Bootstrap 的 CSS 文件, 先引入這樣如果有其他自訂css可以蓋過去
import "bootstrap/dist/js/bootstrap.bundle.min"; // 引入 Bootstrap 的 JavaScript 文件
import React from "react";
import ReactDOM from "react-dom/client"; // 更新導入路徑
import App from "./App";
import "./css/global.css";

// React 18
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
