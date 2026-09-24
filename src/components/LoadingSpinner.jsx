const SIZE_PX = { sm: 48, md: 96, lg: 160 };

export default function LoadingSpinner({
  variant = 'pulse',
  size = 'md',
  color = '#7C3AED',
  glow = true,
  children,
  className = '',
  ariaLabel = 'Loading',
}) {
  const px = SIZE_PX[size] ?? SIZE_PX.md;

  if (variant === 'dots') {
    return (
      <div
        role="status"
        aria-label={ariaLabel}
        className={['flex items-center gap-1', className].join(' ')}
        style={{ color }}
      >
        <span className="loading-dot" />
        <span className="loading-dot" />
        <span className="loading-dot" />
      </div>
    );
  }

  if (variant === 'spin') {
    return (
      <div
        role="status"
        aria-label={ariaLabel}
        className={['relative inline-flex items-center justify-center', className].join(' ')}
        style={{ width: px, height: px }}
      >
        <span
          className="absolute inset-0 rounded-full border-4 border-transparent animate-spin-icon"
          style={{
            borderTopColor: color,
            borderRightColor: color,
            boxShadow: glow ? `0 0 40px ${color}55` : 'none',
          }}
          aria-hidden="true"
        />
        {children && (
          <span className="relative z-10 text-3xl" aria-hidden="true">
            {children}
          </span>
        )}
      </div>
    );
  }

  // pulse (default)
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={['relative inline-flex items-center justify-center', className].join(' ')}
      style={{ width: px, height: px }}
    >
      <span
        className="absolute inset-0 rounded-full animate-pulse-circle"
        style={{
          background: `radial-gradient(circle, ${color} 0%, ${color}88 60%, transparent 100%)`,
          boxShadow: glow ? `0 0 60px ${color}88` : 'none',
        }}
        aria-hidden="true"
      />
      <span
        className="absolute inset-4 rounded-full animate-pulse-slow opacity-70"
        style={{ background: color }}
        aria-hidden="true"
      />
      {children && (
        <span className="relative z-10 text-3xl text-white" aria-hidden="true">
          {children}
        </span>
      )}
    </div>
  );
}
