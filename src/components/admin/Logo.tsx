export const Logo = () => (
  <div
    style={{
      display: "flex",
      alignItems: "baseline",
      gap: "6px",
      padding: "8px 4px",
      fontFamily:
        "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: "22px",
      fontWeight: 600,
      letterSpacing: "-0.02em",
      color: "var(--theme-elevation-1000)",
      lineHeight: 1,
    }}
  >
    <span>åska</span>
    <span style={{ fontSize: "10px", opacity: 0.55, fontWeight: 400 }}>
      cms
    </span>
  </div>
);

export const Icon = () => (
  <div
    style={{
      width: 24,
      height: 24,
      borderRadius: 6,
      display: "grid",
      placeItems: "center",
      background: "var(--theme-success-500)",
      color: "#fff",
      fontFamily:
        "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      fontWeight: 600,
      fontSize: 13,
    }}
  >
    å
  </div>
);

export default Logo;
