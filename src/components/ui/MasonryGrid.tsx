import React from 'react';
import Masonry from 'react-masonry-css';
import './MasonryGrid.css'; // We might need some simple styles if not using Tailwind for everything

interface MasonryGridProps {
  children: React.ReactNode;
  breakpointCols?: Record<number, number> | number;
  className?: string;
  columnClassName?: string;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({
  children,
  breakpointCols = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  },
  className = '',
  columnClassName = ''
}) => {
  return (
    <Masonry
      breakpointCols={breakpointCols}
      className={`my-masonry-grid ${className}`}
      columnClassName={`my-masonry-grid_column ${columnClassName}`}
    >
      {children}
    </Masonry>
  );
};

export default MasonryGrid;
