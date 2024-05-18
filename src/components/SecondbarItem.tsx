import React from 'react';

interface secondbarItemProps {
  name: string;
  active: boolean;
  handleClick: React.MouseEventHandler<HTMLButtonElement>;
}

const SecondbarItem = ({ name, active, handleClick }: secondbarItemProps) => {
  return (
    <button
      className={`second-bar-item ${active ? 'active' : ''}`}
      onClick={handleClick}
    >
      {name}
    </button>
  );
};

export default SecondbarItem;
