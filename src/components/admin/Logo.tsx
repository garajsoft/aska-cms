import { AskaMark, AskaIconMark } from "./AskaMark";

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

export const Icon = () => (
  <div
    style={{
      display: "grid",
      placeItems: "center",
      width: 28,
      height: 28,
      color: "var(--theme-elevation-1000)",
    }}
  >
    <AskaIconMark size={22} />
  </div>
);

export default Logo;
