import React from "react";
import landingImg from "./assets/landing.png";

const NAVY = "#070B14";
const NAVY_2 = "#0B1020";
const WHITE = "#EEF2F7";
const MUTED = "rgba(238,242,247,.72)";
const BORDER = "rgba(255,255,255,.10)";
const ACCENT = "#3CFFB4";

export default function App() {
  return (
    <div style={S.page}>
      <header style={S.topbar}>
        <div style={S.topbarInner}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={S.logoBadge}>
              <GearIcon />
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, fontWeight: 950 }}>
              <span style={{ color: ACCENT }}>Spares</span>
              <span style={{ color: WHITE }}>Hub</span>
            </div>
          </div>

          <div style={{ fontSize: 12, color: MUTED }}>
            Original • Used • NOS • Overhauled (Pre-2000)
          </div>
        </div>
        <div style={S.topbarGlow} />
      </header>

      <main style={S.container}>
        <div style={S.card}>
          <div style={S.hero}>
            <img
              src={landingImg}
              alt="Spares Hub landing"
              style={S.heroImage}
            />

            <div style={S.heroOverlay}>
              <h1 style={S.h1}>Find rare original parts.</h1>
              <p style={S.p}>
                A private exchange for authentic, no-longer-available parts for pre-2000 vehicles.
              </p>

              <div style={S.actions}>
                <button style={S.btnPrimary} onClick={() => alert("Next: Start Searching")}>
                  Start Searching
                </button>
                <button style={S.btnSecondary} onClick={() => alert("Next: Sign In")}>
                  Sign In
                </button>
              </div>

              <div style={S.note}>
                Demo landing page — image served from your GitHub repo and deployed via Netlify.
              </div>
            </div>
          </div>
        </div>

        <footer style={S.footer}>
          <div style={S.footerInner}>
            <div style={{ fontWeight: 950 }}>
              <span style={{ color: ACCENT }}>Spares</span>
              <span style={{ color: WHITE }}>Hub</span>
            </div>
            <div style={{ fontSize: 12, color: MUTED }}>
              © {new Date().getFullYear()} SparesHub (UK). All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 100 100" aria-hidden="true">
      <path
        d="M50 32l7-4 6 5 7-2 5 7 7 1v10l-7 1-5 7-7-2-6 5-7-4-7 4-6-5-7 2-5-7-7-1V45l7-1 5-7 7 2 6-5 7 4z"
        fill={ACCENT}
      />
      <circle cx="50" cy="50" r="12" fill={NAVY_2} />
    </svg>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: `radial-gradient(1200px 800px at 15% 0%, rgba(60,255,180,.10) 0%, ${NAVY} 55%)`,
    color: WHITE,
  },
  topbar: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    background: `linear-gradient(to bottom, rgba(7,11,20,.92), rgba(7,11,20,.70))`,
    backdropFilter: "blur(12px)",
    borderBottom: `1px solid ${BORDER}`,
  },
  topbarGlow: {
    height: 2,
    background: `linear-gradient(90deg, ${ACCENT}, rgba(60,255,180,.30), rgba(255,255,255,.12))`,
    opacity: 0.75,
  },
  topbarInner: {
    maxWidth: 1080,
    margin: "0 auto",
    padding: "14px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 10,
    background: NAVY_2,
    display: "grid",
    placeItems: "center",
    border: `1px solid ${BORDER}`,
  },
  container: {
    maxWidth: 1080,
    margin: "0 auto",
    padding: "18px 14px 30px",
  },
  card: {
    border: `1px solid ${BORDER}`,
    borderRadius: 24,
    background: `linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02))`,
    boxShadow: "0 20px 60px rgba(0,0,0,.55)",
    overflow: "hidden",
  },
  hero: {
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "min(520px, 60vh)",
    objectFit: "cover",
    display: "block",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    padding: 18,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    background: "linear-gradient(to top, rgba(7,11,20,.92), rgba(7,11,20,.12))",
  },
  h1: { fontSize: 28, fontWeight: 950, margin: 0 },
  p: { fontSize: 13, color: MUTED, marginTop: 8, maxWidth: 520 },
  actions: { display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" },
  btnPrimary: {
    background: `linear-gradient(135deg, ${ACCENT}, rgba(60,255,180,.70))`,
    color: "#04140D",
    padding: "12px 14px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 950,
    border: "none",
    minWidth: 160,
  },
  btnSecondary: {
    border: `1px solid ${BORDER}`,
    background: "rgba(255,255,255,.05)",
    color: WHITE,
    padding: "12px 14px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 850,
    minWidth: 120,
  },
  note: {
    marginTop: 10,
    fontSize: 12,
    color: MUTED,
  },
  footer: {
    marginTop: 18,
    borderTop: `1px solid ${BORDER}`,
    paddingTop: 14,
  },
  footerInner: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
  },
};
