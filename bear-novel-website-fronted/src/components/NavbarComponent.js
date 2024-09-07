import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import SearchBar from "./SearchBar";
import ProfilePicture from "./ProfilePicture";
import { useModal } from "../contexts/ModalContext";
import "../css/navbar.css";

// 導欄列組件
const NavbarComponent = ({ isLoggedIn, onLogout, user }) => {
  // 獲取當前路由
  const location = useLocation();
  const navigate = useNavigate();
  const { openModal } = useModal();

  // 根據當前路由決定要顯示的導航內容
  const renderNavLinks = () => {
    if (location.pathname === "/login" || location.pathname === "/register") {
      return (
        // 靠右
        <Nav className="ms-auto">
          <Nav.Link as={Link} to="/" className="custom-navbar-text">
            返回首頁
          </Nav.Link>
        </Nav>
      );
    }

    return (
      // 靠右
      <Nav className="ms-auto">
        <Nav.Link as={Link} to="/" className="custom-nav-link">
          首頁
        </Nav.Link>
        <Nav.Link as={Link} to="/" className="custom-nav-link">
          分類
        </Nav.Link>
        <Nav.Link
          as="span"
          className="custom-nav-link"
          onClick={() => {
            if (isLoggedIn && user && user.userName) {
              navigate("/creator");
            } else {
              openModal("請先登入", "登入會員後，享受更多會員福利!", () => {
                navigate("/login");
              });
            }
          }}
        >
          創作者中心
        </Nav.Link>
        <SearchBar />
        {!isLoggedIn && (
          <>
            <Nav.Link as={Link} to="/login" className="custom-nav-link">
              登入
            </Nav.Link>
            <Nav.Link as={Link} to="/register" className="custom-nav-link">
              註冊
            </Nav.Link>
          </>
        )}
        {isLoggedIn && user && user.userName && (
          <>
            <div className="d-flex align-items-center">
              <ProfilePicture profilePicture={user.profilePicture} size={40} />
              <NavDropdown
                title={user.nickName}
                id="basic-nav-dropdown"
                className="custom-nav-dropdown ms-2"
              >
                <NavDropdown.Item as={Link} to="/logout">
                  登出
                </NavDropdown.Item>
              </NavDropdown>
            </div>
          </>
        )}
      </Nav>
    );
  };

  return (
    <Navbar className="custom-navbar" expand="lg">
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          className="custom-navbar-brand d-flex align-items-center"
        >
          <img
            src="/logo1000.png" // 替換成你的圖片路徑
            alt="小熊小說網"
            className="d-inline-block align-top logo-image" // 使用自定義樣式類
          />
          <span className="ms-1">小熊小說網</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {renderNavLinks()} {/* 根據當前路由顯示相應的導航鏈接 */}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;
