import React from "react";
import "../css/auth.css";

const ProfilePicture = ({ profilePicture }) => {
  return (
    <div className="profile-picture-container">
      {profilePicture ? (
        <img src={profilePicture} alt="Profile" className="profile-picture" />
      ) : (
        <img src="/img/logo425.png" alt="Profile" className="profile-picture" />
      )}
    </div>
  );
};

export default ProfilePicture;
