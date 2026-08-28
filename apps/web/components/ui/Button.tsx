import Link from "next/link";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  className?: string;
};

export function Button({
  children,
  href,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const classes = `button ${variant === "secondary" ? "secondary" : ""} ${className}`;

  if (href) return <Link href={href} className={classes}>{children}</Link>;

  return <button className={classes}>{children}</button>;
}
