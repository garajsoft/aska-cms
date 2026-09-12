import { AskaMark } from "./AskaMark";

export const Logo = () => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "8px 4px",
      color: "var(--theme-elevation-1000)",
    }}
  >
    <AskaMark height={28} />
  </div>
);

// The "Icon" slot sits at the start of Payload's breadcrumb. Show a
// text "Dashboard" link instead of a cropped mark. Wide + nowrap so
// the parent slot doesn't clip it.
export const Icon = () => (
  <a
    href="/admin"
    style={{
      display: "inline-block",
      color: "inherit",
      textDecoration: "none",
      fontSize: 13,
      fontWeight: 500,
      padding: "0 8px",
      whiteSpace: "nowrap",
      minWidth: 90,
    }}
  >
    Dashboard
  </a>
);

export default Logo;
