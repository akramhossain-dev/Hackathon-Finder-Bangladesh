import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "main" | "article";
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const MAX_WIDTHS = {
  sm:   "max-w-2xl",
  md:   "max-w-4xl",
  lg:   "max-w-6xl",
  xl:   "max-w-7xl",
  full: "max-w-full",
};

/**
 * Container — responsive page-width wrapper.
 * Usage: <Container size="xl"><YourContent /></Container>
 */
export default function Container({
  children,
  className = "",
  as: Tag = "div",
  size = "xl",
}: ContainerProps) {
  return (
    <Tag className={`mx-auto w-full ${MAX_WIDTHS[size]} px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </Tag>
  );
}
