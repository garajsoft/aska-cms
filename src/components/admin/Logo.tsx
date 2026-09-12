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
// text "Dashboard" link instead of a cropped mark.
export const Icon = () => (
  <a
    href="/admin"
    style={{
      color: "inherit",
      textDecoration: "none",
      fontSize: 13,
      fontWeight: 500,
      padding: "0 4px",
    }}
  >
    Dashboard
  </a>
);

export default Logo;
