import "bootstrap/dist/css/bootstrap.min.css"; // 引入 Bootstrap 的 CSS 文件, 先引入這樣如果有其他自訂css可以蓋過去
import "bootstrap/dist/js/bootstrap.bundle.min"; // 引入 Bootstrap 的 JavaScript 文件
import "bootstrap-icons/font/bootstrap-icons.css"; // 引入 Bootstrap Icons CSS
import React from "react"; // 引入 React 庫
import ReactDOM from "react-dom/client"; // 引入 ReactDOM
import App from "./App"; // 引入應用程式的主要組件, 是應用的入口點, 包含了應用的主要邏輯和路由設定
import "./css/global.css";
import { Provider } from "react-redux";
import store from "./redux/store";

// React 18 的新渲染方式
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
