import React, { useState, useRef, useId } from 'react';
import { NavPoint } from '../types/fund.ts';
import { formatNav, formatPct, formatAmfiDate } from '../utils/formatters.ts';

interface InteractiveSvgChartProps {
  points: NavPoint[];
  startNav: number;
  isPositive?: boolean;
  height?: number;
}

export const InteractiveSvgChart: React.FC<InteractiveSvgChartProps> = ({
  points,
  startNav,
  isPositive = true,
  height = 280,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const gradientId = useId();

  if (!points || points.length < 2) {
    return (
      <div
        className="w-full flex items-center justify-center text-sm text-slate-400 border border-slate-800 rounded-xl bg-slate-950/40"
        style={{ height }}
      >
        No historical NAV data available for this range
      </div>
    );
  }

  const navs = points.map((p) => p.nav);
  const minNav = Math.min(...navs);
  const maxNav = Math.max(...navs);
  const padding = (maxNav - minNav) * 0.08 || 0.5;
  const yMin = minNav - padding;
  const yMax = maxNav + padding;
  const yRange = yMax - yMin;

  // Chart dimensions in viewBox coordinates
  const width = 800;
  const paddingLeft = 10;
  const paddingRight = 60; // For Y-axis labels
  const paddingTop = 20;
  const paddingBottom = 30; // For X-axis labels
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  // Convert points to coordinates
  const coords = points.map((p, idx) => {
    const x = paddingLeft + (idx / (points.length - 1)) * plotWidth;
    const y = paddingTop + plotHeight - ((p.nav - yMin) / yRange) * plotHeight;
    return { x, y, point: p };
  });

  const lineD = coords.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x},${curr.y}` : `${acc} L ${curr.x},${curr.y}`;
  }, '');

  const areaD = `${lineD} L ${paddingLeft + plotWidth},${paddingTop + plotHeight} L ${paddingLeft},${paddingTop + plotHeight} Z`;

  // Determine active point (either hovered or the latest point)
  const activeIdx = hoverIndex !== null ? hoverIndex : coords.length - 1;
  const activeCoord = coords[activeIdx] || coords[coords.length - 1];
  const activeNav = activeCoord.point.nav;
  const activeDate = activeCoord.point.date;
  const activeChangePct = startNav ? ((activeNav - startNav) / startNav) * 100 : 0;

  // Mouse / Touch handlers for scrubbing
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const relX = (clientX / rect.width) * width;

    // Constrain to plot area
    const clampedX = Math.max(paddingLeft, Math.min(paddingLeft + plotWidth, relX));
    const fraction = (clampedX - paddingLeft) / plotWidth;
    const index = Math.round(fraction * (points.length - 1));
    const safeIndex = Math.max(0, Math.min(points.length - 1, index));
    setHoverIndex(safeIndex);
  };

  const handlePointerLeave = () => {
    setHoverIndex(null);
  };

  const primaryColor = isPositive ? '#10b981' : '#6366f1'; // emerald or indigo

  // Y-axis grid markers (3 levels: high, mid, low)
  const gridLevels = [
    { nav: maxNav, y: paddingTop + plotHeight - ((maxNav - yMin) / yRange) * plotHeight },
    { nav: (maxNav + minNav) / 2, y: paddingTop + plotHeight - (((maxNav + minNav) / 2 - yMin) / yRange) * plotHeight },
    { nav: minNav, y: paddingTop + plotHeight - ((minNav - yMin) / yRange) * plotHeight },
  ];

  // X-axis date labels (start, mid, end)
  const xLabels = [
    { label: formatAmfiDate(points[0].date), x: paddingLeft },
    { label: formatAmfiDate(points[Math.floor(points.length / 2)].date), x: paddingLeft + plotWidth / 2 },
    { label: formatAmfiDate(points[points.length - 1].date), x: paddingLeft + plotWidth },
  ];

  return (
    <div className="relative select-none">
      {/* Interactive Floating Pill Tooltip */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60 text-xs">
        <div className="flex items-center gap-3">
          <div className="font-mono text-slate-400">
            Valuation:{' '}
            <span className="text-slate-200 font-semibold">{formatAmfiDate(activeDate)}</span>
          </div>
          <div className="text-slate-400">·</div>
          <div className="font-mono text-slate-400">
            NAV: <span className="text-slate-100 font-bold text-sm">{formatNav(activeNav)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span className="text-slate-400">Range Change:</span>
          <span
            className={`font-semibold ${
              activeChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatPct(activeChangePct)}
          </span>
        </div>
      </div>

      {/* SVG Canvas with mouse scrub listeners */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="w-full relative cursor-crosshair touch-none"
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible block"
          style={{ maxHeight: height }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primaryColor} stopOpacity="0.32" />
              <stop offset="60%" stopColor={primaryColor} stopOpacity="0.08" />
              <stop offset="100%" stopColor={primaryColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {gridLevels.map((g, idx) => (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={g.y}
                x2={paddingLeft + plotWidth}
                y2={g.y}
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft + plotWidth + 8}
                y={g.y + 4}
                fill="#64748b"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
              >
                ₹{g.nav.toFixed(2)}
              </text>
            </g>
          ))}

          {/* Area Gradient fill */}
          <path d={areaD} fill={`url(#${gradientId})`} />

          {/* Main Trajectory Curve */}
          <path
            d={lineD}
            fill="none"
            stroke={primaryColor}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Vertical Crosshair Line when scrubbing */}
          {activeCoord && (
            <g>
              <line
                x1={activeCoord.x}
                y1={paddingTop}
                x2={activeCoord.x}
                y2={paddingTop + plotHeight}
                stroke="#94a3b8"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
              {/* Outer halo */}
              <circle
                cx={activeCoord.x}
                cy={activeCoord.y}
                r="6"
                fill={primaryColor}
                fillOpacity="0.25"
              />
              {/* Core point */}
              <circle
                cx={activeCoord.x}
                cy={activeCoord.y}
                r="3.5"
                fill={primaryColor}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </g>
          )}

          {/* Bottom X-axis Date labels */}
          {xLabels.map((xl, idx) => {
            const anchor = idx === 0 ? 'start' : idx === xLabels.length - 1 ? 'end' : 'middle';
            return (
              <text
                key={idx}
                x={xl.x}
                y={paddingTop + plotHeight + 18}
                textAnchor={anchor}
                fill="#64748b"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
              >
                {xl.label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
