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

// Return an empty fragment so the breadcrumbs header doesn't show
// a tiny cropped mark next to "Dashboard".
export const Icon = () => null;

export default Logo;
