import React from 'react';

interface KnitStitchProps {
  color?: string;
  size?: number;
  strokeColor?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
  className?: string;
  onClick?: React.MouseEventHandler<SVGSVGElement> | null;
}

const KnitStitch: React.FC<KnitStitchProps> = ({ 
  color = '#ffffff', 
  size = 12, 
  strokeColor = '#cccccc',
  strokeWidth = 0.5,
  style = {},
  className = '',
  onClick = null 
}) => {
  
  return (
    <svg 
      width={size} 
      height={size * 0.8} // Knit stitches are slightly taller than wide
      viewBox="0 0 20 16"
      style={{
        display: 'block',
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
      className={className}
      onClick={onClick || undefined}
    >
      {/* Simple clean V-shaped knit stitch */}
      <path
        d="M 0 0 L 10 12 L 20 0 L 20 16 L 15 16 L 10 8 L 5 16 L 0 16 Z"
        fill={color}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      
      {/* Small highlight to show the V shape */}
      <path
        d="M 2 2 L 10 10 L 18 2"
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default KnitStitch;
