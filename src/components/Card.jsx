export default function Card({
  children,
  className = '',
  hover = true,
  as: Tag = 'div',
  ...rest
}) {
  return (
    <Tag
      className={[
        'bg-navy-light/80 border-2 border-purple/40 rounded-2xl p-6 transition-all duration-300',
        hover ? 'hover:-translate-y-1 hover:border-purple hover:shadow-glow' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  );
}
