// A short brand reveal on the first home-page view of a visit. Pure CSS (see
// globals.css), so it plays before any JavaScript loads; the inline script
// skips it on repeat views. It never blocks clicks and is skipped entirely for
// reduced-motion users.
const skipScript = `try{if(sessionStorage.getItem("rvp_intro"))document.documentElement.classList.add("no-intro");else sessionStorage.setItem("rvp_intro","1")}catch(e){}`;

export function IntroCurtain() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: skipScript }} />
      <div aria-hidden className="intro-curtain">
        <div className="intro-inner">
          <span className="intro-word">
            {"Real Value".split("").map((ch, i) => (
              <span key={i} style={{ "--i": i } as React.CSSProperties}>
                {ch === " " ? " " : ch}
              </span>
            ))}
          </span>
          <span className="intro-line" />
          <span className="intro-tag">
            {["Coimbatore", "Trichy", "Madurai", "Erode", "Pollachi"].map((city) => (
              <span key={city}>{city}</span>
            ))}
          </span>
        </div>
      </div>
    </>
  );
}
