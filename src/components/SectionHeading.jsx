export function SectionHeading({ number, label, title, accent, description, children }) {
  return <div className="section-heading">
    <div className="section-overline"><span>{number}</span><span className="overline-rule"/><span>{label}</span></div>
    <div className="heading-line"><h2>{title}{accent && <><br/><span className="text-accent">{accent}</span></>}</h2>{children}</div>
    {description && <p className="section-description">{description}</p>}
  </div>;
}
