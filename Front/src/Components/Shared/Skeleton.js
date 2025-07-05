import React from 'react';

const Skeleton = ({ height = 20, width = '100%', style = {} }) => (
  <div
    style={{
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-loading 1.2s infinite linear',
      borderRadius: 8,
      height,
      width,
      ...style
    }}
  />
);

export default Skeleton;

// Animación global para el skeleton
if (typeof window !== 'undefined' && !document.getElementById('skeleton-keyframes')) {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.id = 'skeleton-keyframes';
  styleSheet.appendChild(
    document.createTextNode(
      `@keyframes skeleton-loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }`
    )
  );
  document.head.appendChild(styleSheet);
}
