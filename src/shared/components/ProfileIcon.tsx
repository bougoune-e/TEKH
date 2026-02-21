import React from 'react';
import userIcon from '@/assets/icons/navigation/user.svg';

interface ProfileIconProps {
  size?: string;
  className?: string;
}

const ProfileIcon: React.FC<ProfileIconProps> = ({ size = '40px', className = '' }) => {
  return (
    <div
      className={`profile-icon-container flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={userIcon}
        alt="Profile"
        className="w-full h-full object-contain dark:invert transition-all"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default ProfileIcon;
