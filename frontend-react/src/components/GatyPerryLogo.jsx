import { useEffect, useId, useRef, useState } from "react";


const NAME = "Gaty Perry".split("");

// Silueta del gato (calcada de la referencia) y su pata delantera de apoyo.
const BODY = "M384.7 58.7 L378.3 57.3 L373.7 60.0 L371.0 64.7 L369.3 75.3 L367.0 80.0 L353.0 100.3 L337.3 118.0 L319.0 132.0 L310.0 136.0 L301.0 137.3 L293.3 133.0 L287.3 132.0 L278.0 132.3 L277.3 131.3 L284.3 129.0 L292.0 129.0 L301.0 132.3 L309.7 130.3 L313.3 124.3 L317.0 112.0 L316.7 105.0 L313.7 98.3 L304.0 96.0 L295.0 87.0 L288.3 83.7 L279.7 82.3 L265.7 83.7 L245.0 61.7 L241.7 63.7 L238.0 69.7 L236.0 77.7 L237.3 89.3 L242.0 99.3 L240.0 105.3 L239.7 113.7 L244.0 128.0 L243.0 137.0 L240.3 145.7 L234.7 156.3 L223.0 169.7 L214.7 176.0 L193.0 187.3 L178.7 197.0 L165.0 210.3 L157.0 222.0 L150.0 236.3 L144.0 255.7 L140.0 281.3 L138.7 313.3 L129.7 305.7 L123.0 294.3 L121.0 285.7 L122.0 268.3 L125.7 256.3 L132.0 242.7 L166.0 188.3 L178.3 162.0 L182.7 147.7 L185.0 132.0 L185.0 119.7 L182.7 105.7 L176.0 90.7 L165.3 77.7 L154.3 69.7 L136.7 63.0 L126.3 61.3 L116.0 61.3 L101.0 64.0 L85.0 70.7 L71.7 80.3 L59.3 95.3 L55.0 103.3 L50.7 115.3 L50.3 120.0 L53.3 127.7 L59.0 132.3 L67.7 133.7 L74.0 131.3 L78.7 126.3 L86.0 110.0 L92.0 103.0 L103.3 95.3 L115.3 91.7 L131.0 92.7 L142.3 98.0 L150.7 107.3 L155.0 121.3 L154.0 137.7 L147.0 159.0 L137.3 177.3 L106.0 227.0 L97.0 245.7 L92.0 262.3 L90.3 274.3 L90.3 287.7 L92.0 299.0 L98.0 315.7 L105.0 326.0 L110.3 331.3 L118.7 337.0 L134.7 342.0 L241.3 342.3 L241.7 337.3 L239.3 332.0 L235.7 328.3 L231.7 326.3 L222.3 324.3 L210.7 325.0 L202.0 327.0 L200.3 326.3 L222.7 314.0 L231.0 307.3 L240.3 297.0 L244.3 289.7 L246.7 281.0 L246.7 274.0 L243.3 264.0 L235.0 254.7 L223.0 249.0 L208.3 247.7 L194.7 250.3 L201.0 246.3 L215.0 242.7 L228.7 243.7 L238.0 247.3 L247.0 254.7 L252.0 262.7 L254.0 271.0 L253.0 282.3 L261.0 276.7 L272.3 265.7 L287.3 246.7 L297.7 227.7 L302.7 212.3 L305.0 194.7 L322.3 181.3 L342.0 161.7 L354.0 146.3 L365.3 128.0 L373.3 111.0 L379.3 93.3 L383.3 75.3Z";
const LEG = "M305.0 225.7 L290.0 252.3 L280.0 265.3 L267.0 279.3 L276.0 310.0 L280.3 342.3 L317.7 342.3 L318.7 341.0 L318.0 334.0 L315.7 329.7 L309.0 325.0 L302.3 323.7 L301.3 321.3 L301.0 274.3Z";

// Hojitas que titilan alrededor del gato (posiciones precalculadas).
const LEAVES = Array.from({ length: 16 }, (_, i) => {
  const a = Math.PI * (0.55 + i * 0.085) + (Math.PI / 2) * 0.1;
  const r = 48 + (i % 3) * 6;
  return {
    i,
    x: +(60 + Math.cos(a) * r).toFixed(1),
    y: +(60 - Math.sin(a) * r * 1.05).toFixed(1),
    rot: i * 22,
    delay: +(i * 0.22).toFixed(2),
  };
});

export default function GatyPerryLogo({ showTagline = true, size = "md", className = "" }) {
  const id = useId().replace(/:/g, ""); // ids únicos para clipPath/gradiente (permite varias instancias)
  const [wag, setWag] = useState(false);
  const [prints, setPrints] = useState([]);
  const nextId = useRef(0);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const handleClick = (e) => {
    setWag(true);
    timers.current.push(setTimeout(() => setWag(false), 1400));

    const born = Array.from({ length: 5 }, (_, i) => ({
      id: nextId.current++,
      x: e.clientX - 12 + (Math.random() * 60 - 30),
      y: e.clientY - 12,
      dx: Math.random() * 120 - 60,
      r: Math.random() * 60 - 30,
      delay: i * 0.08,
    }));
    setPrints((p) => [...p, ...born]);
    const ids = born.map((b) => b.id);
    timers.current.push(setTimeout(() => setPrints((p) => p.filter((b) => !ids.includes(b.id))), 1700));
  };

  return (
    <div className={`gp${size === "sm" ? " gp-sm" : ""} ${className}`.trim()}>
      <div
        className={`gp-badge${wag ? " gp-wag" : ""}`}
        onClick={handleClick}
        role="img"
        aria-label="Gaty Perry, Clínica Veterinaria. Rancagua, desde 2009"
      >
        <svg className="gp-mascot" viewBox="0 0 400 360" aria-hidden="true">
            <g transform="translate(10 -8) scale(3.1)" opacity=".8">
              {LEAVES.map((l) => (
                <ellipse key={l.i} className="gp-leaf" cx={l.x} cy={l.y} rx="2.2" ry="3.4"
                  transform={`rotate(${l.rot} ${l.x} ${l.y})`} style={{ animationDelay: `${l.delay}s` }} />
              ))}
            </g>
            <defs>
              <linearGradient id={`${id}-fur`} gradientUnits="userSpaceOnUse" x1="180" y1="60" x2="240" y2="345"><stop offset="0" stopColor="#ffffff"/><stop offset="1" stopColor="#e0d3c3"/></linearGradient>
              <clipPath id={`${id}-cSil`}><path d={BODY}/></clipPath>
              <clipPath id={`${id}-cTail`}><path d="M0 0 L210 0 L210 130 L183 200 L145 253 L133 290 L150 290 L150 310 L0 310Z"/></clipPath>
              <clipPath id={`${id}-cArm`}><path d="M316 128 L400 40 L400 215 L312 215 L290 215 L270 170 L285 138Z"/></clipPath>
              <clipPath id={`${id}-cBody`}><path clipRule="evenodd" d="M0 0H420V380H0Z M0 0 L210 0 L210 130 L183 200 L145 253 L133 290 L0 290Z M316 128 L400 40 L400 215 L312 215 L298 175 L293 135Z"/></clipPath>
            </defs>
            <ellipse cx="225" cy="347" rx="135" ry="8" fill="#000" opacity=".25"/>
            <g className="gp-tail"><g clipPath={`url(#${id}-cTail)`}><path d={BODY} fill={`url(#${id}-fur)`}/></g></g>
            <g className="gp-arm"><g clipPath={`url(#${id}-cArm)`}><path d={BODY} fill={`url(#${id}-fur)`}/></g></g>
            <g clipPath={`url(#${id}-cBody)`}><path d={BODY} fill={`url(#${id}-fur)`}/><path d={LEG} fill={`url(#${id}-fur)`}/></g>
            <path d={LEG} fill={`url(#${id}-fur)`}/>
            <g clipPath={`url(#${id}-cSil)`}>
              <polygon points="245,70 241,82 255,81" fill="#f4b6ad"/>
              <path d="M240 124 Q272 146 302 136" fill="none" stroke="#1c6b63" strokeWidth="6" strokeLinecap="round"/>
              <path d="M376 66 L374 75 M381 66 L380 75" stroke="#d6c6b3" strokeWidth="1.6" strokeLinecap="round"/>
            </g>
            <circle cx="283" cy="146" r="5.5" fill="#ffc94d"/>
            <g className="gp-eye"><path d="M284 97 Q291 90 299 95 Q291 102 284 97Z" fill="#7ec8e8"/><ellipse cx="293.5" cy="94.8" rx="2" ry="3.3" fill="#1a1a1a"/><circle cx="294.4" cy="93.4" r="1" fill="#fff"/><path d="M283.5 97.4 Q291 88.5 299.5 94.5" fill="none" stroke="#6b5a4a" strokeWidth="1.5" strokeLinecap="round"/></g>
            <path d="M310 97 L316 98.5 Q316 102 312.5 102.5Z" fill="#ee9a94"/>
            <path d="M312.5 102.5 Q309 108 302 106" fill="none" stroke="#a8937f" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M312 100 L332 94 M312 103 L334 105 M310 106 L328 115" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" opacity=".8"/>
            <path className="gp-spark" d="M394 38 L397 47 L406 50 L397 53 L394 62 L391 53 L382 50 L391 47Z" fill="#ffc94d"/>
          </svg>
        <div className="gp-text">
          <div className="gp-name" aria-hidden="true">
            {NAME.map((c, i) =>
              c === " " ? (
                <span key={i} className="gp-sp" style={{ animationDelay: `${0.35 + i * 0.07}s` }}>&nbsp;</span>
              ) : (
                <span key={i} style={{ animationDelay: `${0.35 + i * 0.07}s` }}>{c}</span>
              )
            )}
          </div>
          <div className="gp-rule" />
          <div className="gp-sub">Clínica Veterinaria</div>
          <svg className="gp-paw" viewBox="0 0 64 64" aria-hidden="true">
                <g fill="#ff7a1a">
                  <ellipse cx="14" cy="28" rx="7" ry="9" transform="rotate(-22 14 28)"/>
                  <ellipse cx="27" cy="16" rx="7" ry="10" transform="rotate(-8 27 16)"/>
                  <ellipse cx="41" cy="16" rx="7" ry="10" transform="rotate(8 41 16)"/>
                  <ellipse cx="54" cy="28" rx="7" ry="9" transform="rotate(22 54 28)"/>
                  <path d="M32 31c-9 0-18 10-18 18 0 6 5 9 11 8 4-1 5-2 7-2s3 1 7 2c6 1 11-2 11-8 0-8-9-18-18-18z"/>
                </g>
              </svg>
        </div>
      </div>

      {showTagline && (
        <div className="gp-tag">
          Rancagua <b>·</b> desde 2009
        </div>
      )}

      {prints.map((p) => (
        <span
          key={p.id}
          className="gp-print"
          aria-hidden="true"
          style={{ left: p.x, top: p.y, animationDelay: `${p.delay}s`, "--dx": `${p.dx}px`, "--r": `${p.r}deg` }}
        >
          🐾
        </span>
      ))}
    </div>
  );
}
