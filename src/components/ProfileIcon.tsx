import React from 'react';

interface ProfileIconProps {
  size?: string;
  className?: string;
}

const ProfileIcon: React.FC<ProfileIconProps> = ({ size = '40px', className = '' }) => {
  return (
    <div
      className={`profile-icon-container ${className}`}
      style={{ '--size': size } as React.CSSProperties}
    >
      <div className="profile-icon">
        <div className="head"></div>
        <div className="body"></div>
      </div>

      <style>{`
        .profile-icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-icon {
          width: var(--size);
          height: var(--size);
          background: transparent;
          position: relative;
          overflow: hidden;
        }

        .head {
          width: 35%;
          height: 35%;
          background: currentColor;
          border-radius: 50%;
          position: absolute;
          top: 15%;
          left: 50%;
          transform: translateX(-50%);
        }

        .body {
          width: 80%;
          height: 45%;
          background: currentColor;
          border-radius: 50% 50% 0 0;
          position: absolute;
          bottom: -5%;
          left: 50%;
          transform: translateX(-50%);
        }
      `}</style>
    </div>
  );
};

export default ProfileIcon;
