import React from 'react';

const Pin = ({ background, borderColor, glyphColor }) => {
  const pinStyle = {
    backgroundColor: background,
    border: `2px solid ${borderColor}`,
    color: glyphColor,
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return <div style={pinStyle}></div>;
};

export default Pin;
