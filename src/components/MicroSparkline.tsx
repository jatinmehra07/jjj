import React from 'react';

interface MicroSparklineProps {
  data?: number[];
  color?: string;
  isPositive?: boolean;
  height?: number;
}

export const MicroSparkline: React.FC<MicroSparklineProps> = ({
  data,
  color,
  isPositive = true,
  height = 42,
}) => {
  if (!data || data.length < 2) {
    return <div className="h-[42px] flex items-center text-xs text-slate-400">No trend data</div>;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const width = 140;
  const paddingY = 4;
  const effectiveHeight = height - paddingY * 2;

  // Generate SVG path points
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - paddingY - ((val - min) / range) * effectiveHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  const strokeColor = color || (isPositive ? '#10b981' : '#f43f5e');
  const gradientId = `spark-grad-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className="relative overflow-hidden w-[140px]" style={{ height }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.28" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {/* Shaded Area */}
        <path d={areaD} fill={`url(#${gradientId})`} />
        {/* Stroke Line */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
