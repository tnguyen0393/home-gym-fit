export function OutboundLink({
  href,
  affiliate,
  className,
  children,
}: {
  href: string;
  affiliate: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel={affiliate ? "sponsored nofollow noopener noreferrer" : "noopener noreferrer"}
      className={className}
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
