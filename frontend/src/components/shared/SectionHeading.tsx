interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  badge?: string;
}

/**
 * SectionHeading — consistent section title + optional subtitle.
 */
export default function SectionHeading({
  title,
  subtitle,
  align = "left",
  badge,
}: SectionHeadingProps) {
  const alignClass = align === "center" ? "text-center" : "text-left";

  return (
    <div className={`mb-8 ${alignClass}`}>
      {badge && (
        <span className="section-badge">{badge}</span>
      )}
      <h2 className="section-heading-title">{title}</h2>
      {subtitle && (
        <p className="section-heading-subtitle">{subtitle}</p>
      )}
    </div>
  );
}
