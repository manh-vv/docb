/**
 *
 * Loading placeholders (Bootstrap `placeholder-glow`) shaped like the content they stand in for
 *
 */
import React, { memo } from 'react';

const LINE_WIDTHS = [10, 8, 11, 6, 9, 7];

interface LinesProps {
  lines?: number;
  label?: string;
}

/** Text lines, for the sidebar and the reader */
export const LoadingLines = memo(({ lines = 3, label = 'Loading...' }: LinesProps) => (
  <div className="placeholder-glow" role="status" aria-live="polite">
    <span className="visually-hidden">{label}</span>
    {Array.from({ length: lines }, (_, i) => (
      <span
        key={i}
        className={`placeholder rounded d-block mb-3 col-${LINE_WIDTHS[i % LINE_WIDTHS.length]}`}
      />
    ))}
  </div>
));

interface BoxProps {
  className?: string;
  style?: React.CSSProperties;
}

/** A block standing in for a card or an image */
export const LoadingBox = memo(({ className = '', style }: BoxProps) => (
  <div className={`placeholder-glow ${className}`} style={style} aria-hidden="true">
    <span className="placeholder rounded w-100 h-100 d-block" />
  </div>
));
