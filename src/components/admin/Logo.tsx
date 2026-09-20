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

// Payload's breadcrumb already has "Dashboard" as the first crumb
// on every view — this slot is redundant. Render nothing here; CSS
// hides the leading separator so we don't get an orphan slash.
export const Icon = () => null;

export default Logo;
