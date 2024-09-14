import React, { useEffect, useState } from "react";
import { Button, Row, Col, Card, Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import ReactDOM from "react-dom";
import NovelPopular from "./NovelPopular";
import { getMyNovelList, selectDisplayList } from "../redux/slices/novelSlice";
import { useModal } from "../contexts/ModalContext";
import { useDispatch, useSelector } from "react-redux";
import CreateNovel from "./CreateNovel";

const DropdownMenu = ({ id, handleSettings, handleDelete }) => (
  <Dropdown.Menu align="end">
    <Dropdown.Item
      onClick={(e) => {
        e.stopPropagation(); // 阻止事件冒泡
        handleSettings(id);
      }}
    >
      作品設定
    </Dropdown.Item>
    <Dropdown.Item
      onClick={(e) => {
        e.stopPropagation(); // 阻止事件冒泡
        handleDelete(id);
      }}
    >
      刪除作品
    </Dropdown.Item>
  </Dropdown.Menu>
);

const MyNovels = () => {
  const dispatch = useDispatch();
  const { isLoggedIn, userLoaded } = useSelector((state) => state.user);
  const { openModal } = useModal();
  const navigate = useNavigate();
  const novels = useSelector(selectDisplayList);
  const novelStatus = useSelector((state) => state.novels.myNovelsStatus);

  const [isCreateNovelModalOpen, setIsCreateNovelModalOpen] = useState(false);
  const openCreateNovelModal = () => setIsCreateNovelModalOpen(true);
  const closeCreateNovelModal = () => setIsCreateNovelModalOpen(false);

  useEffect(() => {
    if (userLoaded && !isLoggedIn) {
      openModal("請先登入", "登入會員後，享受更多會員福利!", () => {
        navigate("/login");
      });
    }
  }, [userLoaded, isLoggedIn, openModal, navigate]);

  useEffect(() => {
    if (userLoaded && isLoggedIn && novelStatus === "idle") {
      dispatch(getMyNovelList());
    }
  }, [userLoaded, isLoggedIn, dispatch, novelStatus]);

  const handleSettings = (novelId) => {
    console.log(`作品設定: ${novelId}`);
  };

  const handleDelete = (novelId) => {
    console.log(`刪除作品: ${novelId}`);
  };

  return (
    <div>
      {isLoggedIn && (
        <div className="my-novels-header">
          <h2>我的作品</h2>
          <Button className="create-novel-btn" onClick={openCreateNovelModal}>
            <img
              src="/img/ui/pen-icon.png"
              alt=""
              className="create-novel-icon"
            ></img>
            新增作品
          </Button>
        </div>
      )}
      {isLoggedIn && (
        <Row className="custom-row">
          <div className="custom-container">
            {novels.length === 0 ? (
              <img
                src="/img/myNovel-empty-tip.png"
                alt=""
                style={{ objectFit: "contain", width: "100%", height: "auto" }}
              ></img>
            ) : (
              novels.map((novel) => (
                <Col xs={12} key={novel.novelId} className="mt-3 mb-3">
                  <Card className="h-100 custom-card position-relative">
                    {/* 下拉選單 */}
                    <Dropdown
                      className="position-absolute top-50 end-0 me-4 translate-middle-y"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Dropdown.Toggle
                        variant="light"
                        id={`dropdown-${novel.novelId}`}
                        className="p-0 border-0 shadow-none"
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </Dropdown.Toggle>

                      {ReactDOM.createPortal(
                        <DropdownMenu
                          id={novel.id}
                          handleSettings={handleSettings}
                          handleDelete={handleDelete}
                        />,
                        document.body
                      )}
                    </Dropdown>

                    <Link
                      to={`/novel/my-novels/${novel.novelId}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <Card.Body className="d-flex align-items-center m-0 p-0">
                        <div className="me-3">
                          <img
                            src="/img/這道長能處算命就送女朋友.jfif" // 這裡替換為實際圖片路徑
                            alt={`${novel.title} 封面`}
                            className="novel-cover-image"
                          />
                        </div>
                        <div className="p-2 text-truncate">
                          <Card.Title className="novel-title">
                            {novel.title}
                          </Card.Title>
                          <Card.Text className="novel-serialized">
                            {novel.isEnding ? "已完結" : "連載中"}
                          </Card.Text>
                          <NovelPopular
                            likeCount={novel.likeCount}
                            viewCount={novel.viewCount}
                          />
                        </div>
                      </Card.Body>
                    </Link>
                  </Card>
                </Col>
              ))
            )}
          </div>
        </Row>
      )}

      <CreateNovel
        isOpen={isCreateNovelModalOpen}
        onRequestClose={closeCreateNovelModal}
      />
    </div>
  );
};

export default MyNovels;
