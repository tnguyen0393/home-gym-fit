export function OutboundLink({
  href,
  affiliate,
  children,
}: {
  href: string;
  affiliate: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel={affiliate ? "sponsored nofollow noopener noreferrer" : "noopener noreferrer"}
    >
      {children}
    </a>
  );
}
