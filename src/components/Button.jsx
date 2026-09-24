const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-3 text-base rounded-xl',
  lg: 'px-6 py-4 text-lg rounded-2xl',
};

const VARIANT_CLASSES = {
  primary:
    'bg-purple text-white hover:bg-purple-dark active:scale-[0.98] shadow-lg shadow-purple/30',
  secondary:
    'bg-transparent text-purple-light border-2 border-purple hover:bg-purple/10 active:scale-[0.98]',
  danger:
    'bg-rose text-white hover:bg-rose-dark active:scale-[0.98] shadow-lg shadow-rose/30',
  outline:
    'bg-transparent text-white border-2 border-white/30 hover:bg-white/10 active:scale-[0.98]',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  children,
  className = '',
  ariaLabel,
  ...rest
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={loading ? 'true' : undefined}
      className={[
        'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 select-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-light focus-visible:ring-offset-2 focus-visible:ring-offset-navy',
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
      {...rest}
    >
      {loading && (
        <span
          className="inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin-icon"
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </button>
  );
}
