import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavbarComponent from "./components/NavbarComponent";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import SuccessPage from "./components/SuccessPage";
import Logout from "./components/Logout";
import Agreement from "./components/Agreement";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Creator from "./components/Creator";
import MyNovels from "./components/MyNovels";
import { useDispatch, useSelector } from "react-redux";
import { getUser, logoutAndResetNovel } from "./redux/slices/userSlice";
import EditNovel from "./components/EditNovel";
import EditChapter from "./components/EditChapter";
import NovelClassification from "./components/NovelClassification";
import NovelPage from "./components/NovelPage";
import ReadNovelChapters from "./components/ReadNovelChapters";

function App() {
  const dispatch = useDispatch();
  // 定義 isLoggedIn 狀態, 追蹤使用者是否已登入
  const { isLoggedIn, user, status } = useSelector((state) => state.user);

  useEffect(() => {
    if (!isLoggedIn && status === "idle") {
      console.log("getUser");
      dispatch(getUser());
    }
  }, [dispatch, isLoggedIn, status]);

  // 登入後狀態更新
  const handleLogin = async () => {
    try {
      console.log("getUser");
      dispatch(getUser());
    } catch (error) {
      dispatch(logoutAndResetNovel());
    }
  };

  // 登出後狀態更新
  const handleLogout = async () => {
    dispatch(logoutAndResetNovel());
  };

  return (
    <Router>
      <NavbarComponent
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        user={user}
      />
      <Routes>
        <Route
          path="/"
          element={
            <div className="container-fluid" style={{ padding: "0" }}>
              <Home user={user} />
            </div>
          }
        />
        <Route
          path="/login"
          element={
            <div className="container">
              <Login onLogin={handleLogin} />
            </div>
          }
        />
        <Route
          path="/register"
          element={
            <div className="container">
              <Register />
            </div>
          }
        />
        <Route
          path="/success"
          element={
            <div className="container">
              <SuccessPage />
            </div>
          }
        />
        <Route
          path="/logout"
          element={
            <div className="container">
              <Logout onLogout={handleLogout} />
            </div>
          }
        />

        <Route
          path="/novel-classification"
          element={
            <div className="container">
              <NovelClassification />
            </div>
          }
        />
        <Route
          path="/creator"
          element={
            <div className="container">
              <Creator />
            </div>
          }
        />
        <Route
          path="/novel/my-novels"
          element={
            <div className="container-fluid" style={{ padding: "0" }}>
              <MyNovels />
            </div>
          }
        />
        <Route
          path="/novel/my-novels/:novelId"
          element={
            <div className="container-fluid" style={{ padding: "0" }}>
              <EditNovel />
            </div>
          }
        />
        <Route
          path="/novel/my-novels/:novelId/edit-chapter/:chapterId"
          element={
            <div className="container">
              <EditChapter />
            </div>
          }
        />
        <Route
          path="/terms"
          element={
            <div className="container">
              <Agreement />
            </div>
          }
        />
        <Route
          path="/privacy-policy"
          element={
            <div className="container">
              <PrivacyPolicy />
            </div>
          }
        />
        <Route
          path="/novel-page/:novelId"
          element={
            <div className="container">
              <NovelPage />
            </div>
          }
        />
        <Route
          path="/read-novel-chapters"
          element={
            <div className="container">
              <ReadNovelChapters />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
