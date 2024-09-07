import React from "react";
import "../css/auth.css";

const ProfilePicture = ({ profilePicture, size }) => {
  const pictureStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  return (
    <div className="profile-picture-container">
      {profilePicture ? (
        <img
          src={profilePicture}
          alt="Profile"
          className="profile-picture"
          style={pictureStyle}
        />
      ) : (
        <img
          src="/img/logo425.png"
          alt="Profile"
          className="profile-picture"
          style={pictureStyle}
        />
      )}
    </div>
  );
};

export default ProfilePicture;
