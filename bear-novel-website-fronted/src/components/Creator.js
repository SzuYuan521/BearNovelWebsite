import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProfilePicture from "./ProfilePicture";
import { useSelector } from "react-redux";
import { useModal } from "../contexts/ModalContext";
import "../css/creator.css";

const Creator = () => {
  const { isLoggedIn, user, userLoaded } = useSelector((state) => state.user);
  const { openModal } = useModal();
  const navigate = useNavigate();

  useEffect(() => {
    if (userLoaded && !isLoggedIn) {
      openModal("請先登入", "登入會員後，享受更多會員福利!", () => {
        navigate("/login");
      });
    }
  }, [userLoaded, isLoggedIn, openModal, navigate]);

  return (
    <div className="creator-container ">
      {isLoggedIn && (
        <div className="creator-user-info">
          <ProfilePicture profilePicture={user.profilePicture} size={100} />
          <div className="mt-3">
            <p className="creator-user-name">{user.userName}</p>
            <p className="creator-user-identity">
              <i className={"bi-star-fill"}> </i>
              創作作家
            </p>
          </div>
        </div>
      )}
      {isLoggedIn && (
        <div className="creator-management-panel">
          <Link
            to="/novel/my-novels"
            className="creator-management-button my-novels-button"
          >
            <img
              src="/img/ui/pen-icon-2.png"
              alt="我的作品"
              className="my-novels-icon"
            />
          </Link>
          <button className="creator-management-button comments-button"></button>
          <button className="creator-management-button data-center-button"></button>
          <button className="creator-management-button income-button"></button>
        </div>
      )}
    </div>
  );
};

export default Creator;
