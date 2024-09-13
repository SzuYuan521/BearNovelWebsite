import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactDOM from "react-dom";
import { useSelector } from "react-redux";
import { Button, Row, Col, Card, Dropdown } from "react-bootstrap";
import { checkAuthor, getAllChapters } from "../api/novel-api";
import "../css/modal.css";
import CreateChapter from "./CreateChapter";
import { useModal } from "../contexts/ModalContext";
import { convertFromRaw } from "draft-js";

const DropdownMenu = ({ id, handleSettings, handleDelete }) => (
  <Dropdown.Menu align="end">
    <Dropdown.Item
      onClick={(e) => {
        e.stopPropagation(); // 阻止事件冒泡
        handleSettings(id);
      }}
    >
      章節設定
    </Dropdown.Item>
    <Dropdown.Item
      onClick={(e) => {
        e.stopPropagation(); // 阻止事件冒泡
        handleDelete(id);
      }}
    >
      刪除章節
    </Dropdown.Item>
  </Dropdown.Menu>
);

const EditNovel = () => {
  const { novelId } = useParams(); // novelId
  const navigate = useNavigate();
  const [isAuthor, setIsAuthor] = useState(null);
  const [isCreateNovelModalOpen, setIsCreateNovelModalOpen] = useState(false);
  const openCreateNovelModal = () => setIsCreateNovelModalOpen(true);
  const closeCreateNovelModal = () => setIsCreateNovelModalOpen(false);
  const { isLoggedIn, userLoaded } = useSelector((state) => state.user);
  const { openModal } = useModal();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  // 取得這本小說的所有章節
  const fetchChapters = useCallback(async () => {
    setLoading(true);
    try {
      const chapters = await getAllChapters(novelId);
      setChapters(chapters);
    } catch (error) {
      console.error("取得小說或章節失敗:", error);
    } finally {
      setLoading(false);
    }
  }, [novelId]);

  // 未登入
  useEffect(() => {
    if (userLoaded && !isLoggedIn) {
      openModal("請先登入", "登入會員後，享受更多會員福利!", () => {
        navigate("/login");
      });
    }
  }, [userLoaded, isLoggedIn, openModal, navigate]);

  // 非作者
  useEffect(() => {
    const verifyAuthor = async () => {
      try {
        const isAuthor = await checkAuthor(novelId);
        setIsAuthor(isAuthor);
        if (!isAuthor) {
          navigate("/404"); // 或其他適當的錯誤處理路由
        }
      } catch (error) {
        navigate("/404"); // 遇到錯誤時導航到 404 頁面
      }
    };
    verifyAuthor();
  }, [novelId, navigate]);

  // 取得章節
  useEffect(() => {
    if (userLoaded && isLoggedIn) {
      fetchChapters();
    }
  }, [userLoaded, isLoggedIn, fetchChapters]);

  if (isAuthor === null || loading) {
    // 加載中狀態
    return <div>Loading...</div>;
  }

  const getPlainTextLength = (content) => {
    if (!content) return 0;
    try {
      const rawContent = JSON.parse(content);
      const contentState = convertFromRaw(rawContent);
      return contentState.getPlainText().length;
    } catch (error) {
      console.error("解析 JSON 內容失敗", error);
      return content.length;
    }
  };

  const handleSettings = (chapterId) => {
    console.log(`章節設定: ${chapterId}`);
  };

  const handleDelete = (chapterId) => {
    console.log(`刪除章節: ${chapterId}`);
  };

  return (
    <div>
      <div className="my-novels-header">
        <h2>編輯作品</h2>
        <Button className="create-novel-btn" onClick={openCreateNovelModal}>
          <img
            src="/img/ui/pen-icon.png"
            alt=""
            className="create-novel-icon"
          ></img>
          新增章節
        </Button>
      </div>
      {isLoggedIn && (
        <Row className="custom-row">
          <div className="custom-container">
            {chapters.length === 0 ? (
              <img
                src="/img/chapter-empty-tip.png"
                alt=""
                style={{ objectFit: "contain", width: "100%", height: "auto" }}
              ></img>
            ) : (
              chapters.map((chapter) => (
                <Col xs={12} key={chapter.chapterId} className="mt-3 mb-3">
                  <Card className="h-100 custom-card position-relative">
                    {/* 下拉選單 */}
                    <Dropdown
                      className="position-absolute top-50 end-0 me-4 translate-middle-y"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Dropdown.Toggle
                        variant="light"
                        id={`dropdown-${chapter.chapterId}`}
                        className="p-0 border-0 shadow-none"
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </Dropdown.Toggle>

                      {ReactDOM.createPortal(
                        <DropdownMenu
                          id={chapter.chapterId}
                          handleSettings={handleSettings}
                          handleDelete={handleDelete}
                        />,
                        document.body
                      )}
                    </Dropdown>

                    <Link
                      to={`/novel/my-novels/${novelId}/edit-chapter/${chapter.chapterId}`}
                      state={{ chapter }}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <Card.Body className="chapter-card d-flex align-items-center m-0 p-0">
                        <div className="p-4 text-truncate">
                          <Card.Title className="chapter-title">
                            第{chapter.chapterNumber}章 {chapter.title}
                          </Card.Title>
                          <Card.Text className="chapter-word-count">
                            {getPlainTextLength(chapter.content)} 字
                          </Card.Text>
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

      <CreateChapter
        novelId={novelId}
        isOpen={isCreateNovelModalOpen}
        onRequestClose={closeCreateNovelModal}
        refreshChapters={fetchChapters}
      />
    </div>
  );
};

export default EditNovel;
