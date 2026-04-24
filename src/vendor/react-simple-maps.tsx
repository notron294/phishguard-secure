import React from "react";

// Minimal, local replacement for a subset of `react-simple-maps` used by PhishingMap.
// This is intentionally lightweight: it provides `ComposableMap`, `Geographies`,
// `Geography`, `Marker`, `Line`, and `ZoomableGroup` so the app can run without
// the external dependency. It uses a simple equirectangular projection for coords.

const WIDTH = 1000;
const HEIGHT = 500;

function project(coords: [number, number]) {
  const [lon, lat] = coords;
  const x = ((lon + 180) / 360) * WIDTH;
  const y = ((90 - lat) / 180) * HEIGHT;
  return [x, y];
}

export const ComposableMap: React.FC<any> = ({ children, className, style }) => {
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width="100%"
      height="100%"
      className={className}
      style={style}
      preserveAspectRatio="xMidYMid meet"
    >
      {children}
    </svg>
  );
};

export const ZoomableGroup: React.FC<any> = ({ children }) => {
  // No zoom/pan interaction in the stub — just render children as-is.
  return <g>{children}</g>;
};

export const Geographies: React.FC<any> = ({ children }) => {
  // Provide an empty geographies array so the consuming code will render nothing
  // for country shapes (we keep the map focused on markers/arcs which are still shown).
  return <g>{children({ geographies: [] })}</g>;
};

export const Geography: React.FC<any> = () => null;

export const Marker: React.FC<any> = ({ coordinates, children }) => {
  const [x, y] = project(coordinates as [number, number]);
  return <g transform={`translate(${x}, ${y})`}>{children}</g>;
};

export const Line: React.FC<any> = ({ from, to, stroke = "#fff", strokeWidth = 1, strokeOpacity = 1, strokeLinecap, className }) => {
  const [x1, y1] = project(from as [number, number]);
  const [x2, y2] = project(to as [number, number]);
  const d = `M ${x1} ${y1} L ${x2} ${y2}`;
  return (
    <path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeOpacity={strokeOpacity}
      strokeLinecap={strokeLinecap}
      className={className}
    />
  );
};

export default {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
  ZoomableGroup,
};
