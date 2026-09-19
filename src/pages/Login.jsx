import React, { useEffect, useRef, useState } from "react";
import { signInWithGoogle } from "@/lib/supabaseAuth"; // Using your actual file!
import * as supabaseAuth from "@/lib/supabaseAuth"; // only used to find the Supabase client for the temporary login
import { Download, ImagePlus, Lightbulb, Loader2, RotateCcw } from "lucide-react";
import "@fontsource/rubik/900.css"; // npm i @fontsource/rubik  → font for the wordmark

// Font used for the "SCHEDUL-Ulu" wordmark. To use a different font later,
// install/import it and change the name here.
// TEMPORARY email + password login (real Supabase sign-in, no Google needed).
// Set to false when you're done testing to hide it.
const SHOW_TEMP_LOGIN = true;

const WORDMARK_FONT = '"Rubik", system-ui, sans-serif';

/* ------------------------------------------------------------------ */
/*  How the artwork works                                              */
/*                                                                     */
/*  - Regular users only see two static files from /public:            */
/*      login-halftone.png       (light mode)                          */
/*      login-halftone-dark.png  (dark mode)                           */
/*    If they don't exist yet, the original artwork is shown instead.  */
/*  - The upload / convert / download tools appear ONLY in            */
/*    `npm run dev` and are stripped from the production build.        */
/*                                                                     */
/*  Workflow: npm run dev → Upload photo → Download PNGs → put both    */
/*  files in the public/ folder → deploy.                              */
/* ------------------------------------------------------------------ */
const IS_DEV = import.meta.env.DEV;
const BASE = import.meta.env.BASE_URL;
const SHIPPED_LIGHT = `${BASE}login-halftone.png`;
const SHIPPED_DARK = `${BASE}login-halftone-dark.png`;

/* ------------------------------------------------------------------ */
/*  Halftone settings – tweak these to change the look                 */
/* ------------------------------------------------------------------ */
const HALFTONE = {
  width: 1200, // output size (px). Displayed scaled down, so it stays sharp.
  height: 1240,
  cell: 5, // dot spacing in PIXELS = dot size. SMALLER number = smaller dots (try 5-10)
  contrast: 1, // 1 = true to the photo, higher = punchier colours
  autoLevels: false, // true = stretch dull / washed-out photos to the full range
};

// Light mode  = printed look (cyan / magenta / yellow / black dots on paper)
// Dark mode   = glowing look (red / green / blue dots of light on black)
// Both keep the photo's real colours.
const PAPER_LIGHT = "#f4f2ee";
const PAPER_DARK = "#0e0e10";

const lookFor = (dark) => ({
  ...HALFTONE,
  mode: dark ? "rgb" : "cmyk",
  paper: dark ? PAPER_DARK : PAPER_LIGHT,
});

const MAX_SOURCE_SIZE = 1600; // uploaded photos are shrunk to this before converting
const THEME_KEY = "theme";

/* ------------------------------------------------------------------ */
/*  Dark / light mode                                                  */
/*  Toggles the `dark` class on <html> (the shadcn/Tailwind default)   */
/*  and remembers the choice.                                          */
/* ------------------------------------------------------------------ */
function useDarkMode() {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "dark" || saved === "light") return saved === "dark";
    } catch {
      /* ignore */
    }
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  };

  return [dark, toggle];
}

/* ------------------------------------------------------------------ */
/*  Light-bulb toggle: lit in light mode, off in dark mode             */
/* ------------------------------------------------------------------ */
function ThemeBulb({ dark, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      title={dark ? "Turn the light on" : "Turn the light off"}
      className={`grid h-10 w-10 place-items-center rounded-full border transition-all duration-300 active:scale-90 outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        dark
          ? "border-border bg-card text-muted-foreground hover:text-foreground"
          : "border-amber-300/70 bg-amber-50 text-amber-500"
      }`}
      style={{
        boxShadow: dark
          ? "none"
          : "0 0 0 4px rgba(251, 191, 36, 0.12), 0 0 22px rgba(251, 191, 36, 0.45)",
      }}
    >
      <Lightbulb
        className="h-[18px] w-[18px] transition-all duration-300"
        strokeWidth={1.9}
        fill={dark ? "none" : "currentColor"}
        fillOpacity={0.28}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Halftone helpers (only used in dev)                                */
/* ------------------------------------------------------------------ */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read that image."));
    img.src = src;
  });
}

// Shrinks the uploaded file and returns a JPEG data URL.
async function prepareUpload(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(
      1,
      MAX_SOURCE_SIZE / Math.max(img.naturalWidth, img.naturalHeight)
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff"; // so transparent PNGs don't turn black
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.9);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Draws a COLOUR halftone of `img` onto `canvas`.
//  - "cmyk": four screens of cyan/magenta/yellow/black dots, multiplied on paper
//  - "rgb" : three screens of red/green/blue dots of light, added on black
// Dot AREA is matched to the amount of ink, so the colours you see from a
// distance are the photo's real colours.
function renderHalftone(canvas, img, opts) {
  const { cell, contrast, autoLevels, mode, paper } = opts;
  const W = canvas.width;
  const H = canvas.height;

  // 1. Cover-crop the photo to the canvas size and read its pixels.
  const src = document.createElement("canvas");
  src.width = W;
  src.height = H;
  const sctx = src.getContext("2d", { willReadFrequently: true });
  sctx.fillStyle = "#fff";
  sctx.fillRect(0, 0, W, H);
  const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  sctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
  const { data } = sctx.getImageData(0, 0, W, H);

  // 2. Tone curve. Optional auto-levels from brightness (2nd-98th percentile),
  //    applied equally to every colour channel so hues don't shift.
  let lo = 0;
  let range = 1;
  if (autoLevels) {
    const hist = new Uint32Array(256);
    let counted = 0;
    for (let i = 0; i < data.length; i += 12) {
      const l = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      hist[Math.min(255, l | 0)]++;
      counted++;
    }
    const percentile = (q) => {
      let acc = 0;
      for (let b = 0; b < 256; b++) {
        acc += hist[b];
        if (acc >= q * counted) return b / 255;
      }
      return 1;
    };
    lo = percentile(0.02);
    range = Math.max(percentile(0.98) - lo, 0.1);
  }
  const levels = (v) => {
    const t = (v - lo) / range;
    return Math.min(1, Math.max(0, (t - 0.5) * contrast + 0.5));
  };

  // 3. Dot radius for a given ink amount (0-1), as a fraction of the cell.
  //    Solves "how big must a dot be so the ink COVERS that share of the paper",
  //    including overlap between neighbouring dots in dark areas.
  const coverage = (r) => {
    if (r <= 0.5) return Math.PI * r * r;
    const lens = 2 * r * r * Math.acos(1 / (2 * r)) - 0.5 * Math.sqrt(4 * r * r - 1);
    return Math.PI * r * r - 2 * lens;
  };
  const LUT = 256;
  const radiusLUT = new Float32Array(LUT + 1);
  for (let i = 0; i <= LUT; i++) {
    let a = 0;
    let b = Math.SQRT1_2;
    for (let n = 0; n < 30; n++) {
      const mid = (a + b) / 2;
      if (coverage(mid) < i / LUT) a = mid;
      else b = mid;
    }
    radiusLUT[i] = (a + b) / 2;
  }

  // 4. Average colour around a point (3x3 samples), returned as levelled 0-1 RGB.
  const offsets = [-cell / 3, 0, cell / 3];
  const rgb = [0, 0, 0];
  const sampleRGB = (x, y) => {
    let r = 0;
    let g = 0;
    let b = 0;
    for (const dy of offsets) {
      for (const dx of offsets) {
        const xi = Math.min(W - 1, Math.max(0, Math.round(x + dx)));
        const yi = Math.min(H - 1, Math.max(0, Math.round(y + dy)));
        const i = (yi * W + xi) * 4;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }
    }
    rgb[0] = levels(r / (9 * 255));
    rgb[1] = levels(g / (9 * 255));
    rgb[2] = levels(b / (9 * 255));
  };

  // 5. Which screens to draw. Each screen has its own angle, ink and a
  //    function that says how much of that ink (0-1) the current colour needs.
  const screens =
    mode === "rgb"
      ? [
          { angle: 15, ink: "#ff0000", amount: () => rgb[0] },
          { angle: 75, ink: "#00ff00", amount: () => rgb[1] },
          { angle: 45, ink: "#0000ff", amount: () => rgb[2] },
        ]
      : (() => {
          const k = () => 1 - Math.max(rgb[0], rgb[1], rgb[2]);
          const ch = (i) => () => {
            const kk = k();
            return kk >= 1 ? 0 : (1 - rgb[i] - kk) / (1 - kk);
          };
          return [
            { angle: 0, ink: "#ffff00", amount: ch(2) }, // yellow
            { angle: 15, ink: "#00ffff", amount: ch(0) }, // cyan
            { angle: 75, ink: "#ff00ff", amount: ch(1) }, // magenta
            { angle: 45, ink: "#0d0d0d", amount: k }, // black
          ];
        })();

  // 6. Paper first, then one layer of dots per screen.
  const ctx = canvas.getContext("2d");
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = mode === "rgb" ? "lighter" : "multiply";

  const cx = W / 2;
  const cy = H / 2;
  const half = Math.ceil(Math.hypot(W, H) / cell / 2) + 1;

  for (const screen of screens) {
    const rad = (screen.angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    ctx.beginPath();

    for (let gy = -half; gy <= half; gy++) {
      for (let gx = -half; gx <= half; gx++) {
        const ox = gx * cell;
        const oy = gy * cell;
        const x = cx + ox * cos - oy * sin;
        const y = cy + ox * sin + oy * cos;
        if (x < -cell || x > W + cell || y < -cell || y > H + cell) continue;

        sampleRGB(x, y);
        const amount = Math.min(1, Math.max(0, screen.amount()));
        const r = cell * radiusLUT[Math.round(amount * LUT)];
        if (r < 0.35) continue;
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, Math.PI * 2);
      }
    }

    ctx.fillStyle = screen.ink;
    ctx.fill();
  }

  ctx.globalCompositeOperation = "source-over";
}

function saveCanvas(canvas, filename) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      resolve();
    }, "image/png");
  });
}

/* ------------------------------------------------------------------ */
/*  Right-hand panel                                                   */
/* ------------------------------------------------------------------ */
function HalftonePanel({ dark }) {
  const canvasRef = useRef(null);
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null); // dev only: uploaded photo (data URL)
  const [lightMissing, setLightMissing] = useState(false);
  const [darkMissing, setDarkMissing] = useState(false);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState("");

  // Dev only: draw the halftone preview (re-drawn when the theme flips).
  useEffect(() => {
    if (!preview) return;
    let cancelled = false;
    loadImage(preview)
      .then((img) => {
        if (!cancelled && canvasRef.current) {
          renderHalftone(canvasRef.current, img, lookFor(dark));
        }
      })
      .catch(() => {
        if (cancelled) return;
        setError("Couldn't draw that image. Try a JPG or PNG.");
        setPreview(null);
      });
    return () => {
      cancelled = true;
    };
  }, [preview, dark]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be picked again later
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG or WebP).");
      return;
    }

    setError("");
    setConverting(true);
    try {
      setPreview(await prepareUpload(file));
    } catch (err) {
      console.error("Halftone upload error:", err);
      setError("Couldn't read that image. Try a JPG or PNG.");
    } finally {
      setConverting(false);
    }
  };

  // Saves BOTH versions (light + dark). Your browser may ask to allow
  // multiple downloads – choose Allow.
  const handleDownload = async () => {
    if (!preview) return;
    const img = await loadImage(preview);
    for (const isDark of [false, true]) {
      const c = document.createElement("canvas");
      c.width = HALFTONE.width;
      c.height = HALFTONE.height;
      renderHalftone(c, img, lookFor(isDark));
      await saveCanvas(c, isDark ? "login-halftone-dark.png" : "login-halftone.png");
      await new Promise((r) => setTimeout(r, 400));
    }
  };

  const handleReset = () => {
    setError("");
    setPreview(null);
  };

  let artwork;
  if (IS_DEV && preview) {
    artwork = (
      <canvas
        ref={canvasRef}
        width={HALFTONE.width}
        height={HALFTONE.height}
        role="img"
        aria-label="Halftone preview of the uploaded photo"
        className="w-full h-full block object-cover"
      />
    );
  } else if (lightMissing) {
    artwork = <DefaultIllustration />;
  } else {
    artwork = (
      <>
        <img
          src={SHIPPED_LIGHT}
          alt=""
          aria-hidden="true"
          onError={() => setLightMissing(true)}
          className="block dark:hidden w-full h-full object-cover"
        />
        {/* If the dark file isn't there yet, reuse the light one, dimmed */}
        <img
          src={darkMissing ? SHIPPED_LIGHT : SHIPPED_DARK}
          alt=""
          aria-hidden="true"
          onError={() => setDarkMissing(true)}
          className={`hidden dark:block w-full h-full object-cover ${
            darkMissing ? "dark:brightness-75" : ""
          }`}
        />
      </>
    );
  }

  return (
    <div className="hidden md:block md:basis-[54%] relative bg-muted">
      {artwork}

      {/* Developer tools – exist only in `npm run dev`, never in production */}
      {IS_DEV && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-end gap-2">
            {error ? (
              <span className="mr-auto rounded-lg bg-card/90 px-3 py-1.5 text-xs text-destructive shadow">
                {error}
              </span>
            ) : (
              preview && (
                <span className="mr-auto rounded-lg bg-card/90 px-3 py-1.5 text-xs text-muted-foreground shadow">
                  Preview only. Download both files into public/
                </span>
              )
            )}

            {preview && (
              <>
                <button
                  type="button"
                  onClick={handleReset}
                  title="Discard the preview"
                  className="h-9 px-3.5 rounded-full border border-border bg-card/90 backdrop-blur flex items-center gap-1.5 text-xs font-medium text-foreground shadow hover:bg-card transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  title="Saves login-halftone.png and login-halftone-dark.png"
                  className="h-9 px-3.5 rounded-full border border-border bg-card/90 backdrop-blur flex items-center gap-1.5 text-xs font-medium text-foreground shadow hover:bg-card transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PNGs
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={converting}
              className="h-9 px-4 rounded-full border border-border bg-card/90 backdrop-blur flex items-center gap-1.5 text-xs font-medium text-foreground shadow hover:bg-card transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {converting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ImagePlus className="w-3.5 h-3.5" />
              )}
              {converting ? "Converting…" : preview ? "Change photo" : "Upload photo"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Login page                                                         */
/* ------------------------------------------------------------------ */
export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dark, toggleDark] = useDarkMode();
  const [tempEmail, setTempEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [tempLoading, setTempLoading] = useState(false);

  // Temporary login: signs in a user you created in Supabase
  // (Authentication -> Users -> Add user, with "Auto Confirm User" ticked).
  const handleTempLogin = async (e) => {
    e.preventDefault();
    setError("");
    const client =
      supabaseAuth.supabase ?? supabaseAuth.supabaseClient ?? supabaseAuth.client ?? null;
    if (!client?.auth?.signInWithPassword) {
      setError("Couldn't find the Supabase client. Export it from supabaseAuth.js as `supabase`.");
      return;
    }
    setTempLoading(true);
    try {
      const { error: err } = await client.auth.signInWithPassword({
        email: tempEmail.trim(),
        password: tempPassword,
      });
      if (err) throw err;
      window.location.reload(); // the app picks up the new session on reload
    } catch (err) {
      console.error("Temporary sign-in error:", err);
      setError(`Sign-in failed: ${err.message}`);
      setTempLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      // This calls the function from your supabaseAuth.js
      await signInWithGoogle();

      // Note: We don't manually redirect to "/" here because Supabase
      // will automatically refresh the page/app when the login finishes.
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError(`Sign-in failed: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="w-full max-w-5xl min-h-[620px] rounded-[20px] overflow-hidden shadow-2xl flex flex-col md:flex-row bg-card border border-border">

        {/* LEFT: auth panel */}
        <div className="flex-1 md:basis-[46%] flex flex-col px-8 sm:px-14 pt-10 pb-8">
          {/* logo mark + light-bulb theme toggle */}
          <div className="flex items-center justify-between">
            <svg width="26" height="22" viewBox="0 0 26 22" fill="none" className="text-foreground">
              <path d="M2 2L24 10.5L13.5 13L2 2Z" fill="currentColor" />
              <path d="M13.5 13L15.5 20L18 13.5L13.5 13Z" fill="currentColor" />
            </svg>
            <ThemeBulb dark={dark} onToggle={toggleDark} />
          </div>

          <div className="max-w-[330px] mx-auto w-full pt-14 flex-1 [container-type:inline-size]">
            {/* wordmark – scales with the column width, never wider than 50px */}
            <p
              className="text-[40px] font-black leading-none tracking-tight text-foreground whitespace-nowrap mb-5"
              style={{ fontFamily: WORDMARK_FONT, fontSize: "min(13cqw, 50px)" }}
            >
              SCHEDUL-Ulu
            </p>
            <h1 className="text-2xl font-heading font-semibold text-foreground mb-2 tracking-tight">
              Welcome
            </h1>
            <p className="text-[13.5px] text-muted-foreground mb-6 leading-relaxed">
              Sign in to save your schedule and keep it in sync.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full h-12 rounded-full border border-border bg-card flex items-center justify-center gap-2.5 text-sm font-medium text-foreground shadow-sm hover:bg-muted active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-[18px] h-[18px] animate-spin" />
              ) : (
                <GoogleIcon className="w-[18px] h-[18px]" />
              )}
              {loading ? "Signing in…" : "Sign in with Google"}
            </button>

            <p className="mt-4 text-center text-[11.5px] leading-relaxed text-muted-foreground">
              By continuing, you agree to our Terms and Privacy Policy.
            </p>

            {SHOW_TEMP_LOGIN && (
              <form
                onSubmit={handleTempLogin}
                className="mt-6 pt-5 border-t border-dashed border-border space-y-2.5"
              >
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Temporary login
                </p>
                <input
                  type="email"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="username"
                  required
                  className="w-full h-11 rounded-full border border-border bg-card px-[18px] text-[13.5px] text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <input
                  type="password"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                  className="w-full h-11 rounded-full border border-border bg-card px-[18px] text-[13.5px] text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <button
                  type="submit"
                  disabled={tempLoading}
                  className="w-full h-11 rounded-full bg-foreground text-background text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {tempLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {tempLoading ? "Signing in…" : "Sign in"}
                </button>
              </form>
            )}
          </div>

          <div className="flex justify-center gap-4 text-xs text-muted-foreground pt-8">
            <a href="#" className="hover:text-foreground transition-colors">Help</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          </div>
        </div>

        {/* RIGHT: halftone artwork (developer tools show only in dev mode) */}
        <HalftonePanel dark={dark} />

      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Default artwork (shown until public/login-halftone.png exists)     */
/* ------------------------------------------------------------------ */
function DefaultIllustration() {
  return (
    <svg
      viewBox="0 0 600 620"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full block dark:invert"
    >
      <defs>
        <pattern id="dotsXS" width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.5" fill="#111" />
        </pattern>
        <pattern id="dotsS" width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.9" fill="#111" />
        </pattern>
        <pattern id="dotsM" width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.3" fill="#111" />
        </pattern>
        <pattern id="dotsL" width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.7" fill="#111" />
        </pattern>
        <clipPath id="frame">
          <rect x="0" y="0" width="600" height="620" />
        </clipPath>
      </defs>

      <g clipPath="url(#frame)">
        <rect x="0" y="0" width="600" height="620" fill="#ededed" />
        <rect x="0" y="0" width="600" height="620" fill="url(#dotsXS)" />

        <g fill="#fff">
          <ellipse cx="470" cy="95" rx="95" ry="46" />
          <ellipse cx="410" cy="115" rx="60" ry="34" />
          <ellipse cx="530" cy="120" rx="55" ry="30" />
        </g>
        <g fill="none" stroke="#111" strokeWidth="1.4" opacity="0.5">
          <ellipse cx="470" cy="95" rx="95" ry="46" />
        </g>

        <g fill="url(#dotsS)">
          <rect x="150" y="60" width="30" height="180" />
          <rect x="190" y="90" width="24" height="150" />
          <rect x="225" y="40" width="34" height="200" />
        </g>

        <rect x="0" y="150" width="600" height="70" fill="url(#dotsL)" />
        <rect x="0" y="150" width="600" height="6" fill="#111" />
        <rect x="0" y="216" width="600" height="6" fill="#111" />

        <g fill="url(#dotsM)">
          <rect x="70" y="150" width="16" height="330" />
          <rect x="120" y="150" width="12" height="330" />
          <rect x="165" y="150" width="10" height="330" />
        </g>

        <circle cx="60" cy="330" r="150" fill="none" stroke="#111" strokeWidth="34" />
        <circle cx="60" cy="330" r="150" fill="none" stroke="url(#dotsL)" strokeWidth="34" />
        <circle cx="60" cy="330" r="112" fill="#ededed" />
        <circle cx="60" cy="330" r="112" fill="url(#dotsXS)" />

        <g>
          <path
            d="M330 470 q10 -55 80 -60 q70 -5 95 30 q20 28 -10 55 q-45 35 -120 15 q-55 -14 -45 -40 Z"
            fill="url(#dotsL)"
          />
          <path
            d="M420 500 q40 -30 95 -18 q45 10 45 40 q0 30 -55 34 q-70 5 -95 -25 q-10 -13 10 -31 Z"
            fill="url(#dotsM)"
          />
          <ellipse cx="270" cy="520" rx="55" ry="34" fill="url(#dotsL)" />
          <ellipse cx="335" cy="545" rx="38" ry="24" fill="url(#dotsM)" />
        </g>

        <g>
          <path
            d="M215 560 C215 480 205 430 185 400 C205 415 220 435 226 455 C228 400 210 355 175 330 C210 340 235 375 240 415 C248 370 235 330 205 305 C245 315 265 360 262 405 C275 375 300 365 320 370 C295 385 278 410 275 435 C295 425 315 430 325 445 C300 445 280 460 270 480 C280 490 285 505 282 520 C270 505 255 500 240 505 C245 525 240 545 225 560 Z"
            fill="#111"
          />
        </g>
        <rect x="222" y="555" width="10" height="30" fill="#111" />

        <rect x="0" y="560" width="600" height="60" fill="url(#dotsM)" />
        <rect x="0" y="558" width="600" height="4" fill="#111" />
        <g stroke="#fff" strokeWidth="2" opacity="0.5">
          <line x1="20" y1="580" x2="120" y2="580" />
          <line x1="160" y1="590" x2="260" y2="590" />
          <line x1="320" y1="580" x2="440" y2="580" />
          <line x1="470" y1="595" x2="560" y2="595" />
        </g>

        <ellipse cx="470" cy="590" rx="70" ry="42" fill="#fff" />
        <ellipse cx="470" cy="590" rx="70" ry="42" fill="none" stroke="#111" strokeWidth="1.4" />
        <ellipse cx="470" cy="596" rx="55" ry="28" fill="url(#dotsS)" />

        <rect x="0" y="0" width="600" height="620" fill="url(#dotsXS)" opacity="0.15" />
      </g>
    </svg>
  );
}

function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.4C29.6 35.2 26.9 36 24 36c-5.3 0-9.7-3-11.4-7.3l-6.5 5C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.6 5.4C41.2 35.9 44 30.4 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}