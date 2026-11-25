// Loading overlay shown on the Pulse login page while content.js signs in.
// Shadow DOM keeps Pulse's CSS out; Pulse's theme variables still inherit in, so it matches the site.
const STEPS = ["Requesting OTP", "Reading code from Gmail", "Signing in"];

const showOverlay = () => {
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;inset:0;z-index:2147483647";
  const root = host.attachShadow({ mode: "open" });
  const mark = `<span class="m"><svg viewBox="0 0 16 16" aria-hidden="true"><path class="ok" d="M4 8.5l2.6 2.6L12 5.6"/><path class="x" d="M5 5l6 6M11 5l-6 6"/></svg></span>`;
  root.innerHTML = `<style>
    :host { all: initial; }
    * { box-sizing: border-box; margin: 0; }
    ::selection { background: hsl(var(--primary, 18 70% 42%) / .2); }
    .wrap {
      --p: hsl(var(--primary, 18 70% 42%));
      --line: hsl(var(--border, 30 15% 88%));
      --bad: hsl(var(--destructive, 0 70% 46%));
      --dim: hsl(30 8% 42%);
      position: fixed; inset: 0; display: grid; place-items: center;
      font: 400 15px/1.45 "Plus Jakarta Sans", system-ui, sans-serif;
      color: hsl(var(--foreground, 30 10% 12%));
    }
    .scrim {
      position: absolute; inset: 0;
      background: hsl(var(--background, 40 30% 97%) / .72);
      backdrop-filter: blur(6px);
      animation: fade .25s ease-out both;
    }
    .card {
      position: relative; width: min(340px, calc(100vw - 32px));
      padding: 28px 28px 24px; border-radius: 14px;
      background: hsl(var(--card, 0 0% 100%));
      border: 1px solid var(--line);
      box-shadow: 0 16px 40px -16px rgb(40 25 10 / .28), 0 2px 6px rgb(40 25 10 / .06);
      animation: rise .5s cubic-bezier(.16, 1, .3, 1) both;
    }
    .wrap.out .card, .wrap.out .scrim { animation: fade .15s ease-in reverse both; }
    h2 { font-size: 17px; font-weight: 700; letter-spacing: -.01em; margin-bottom: 22px; }
    ol { list-style: none; padding: 0; display: grid; gap: 18px; }
    li { position: relative; display: flex; align-items: center; gap: 12px; color: var(--dim); transition: color .2s; }
    li[data-s] { color: inherit; }
    li:not(:last-child)::after {
      content: ""; position: absolute; left: 9px; top: 24px; width: 2px; height: 12px;
      border-radius: 1px; background: var(--line); transform-origin: top;
    }
    li[data-s=done]::after { background: var(--p); animation: grow .3s cubic-bezier(.16, 1, .3, 1) both; }
    .m {
      flex: none; width: 20px; height: 20px; border-radius: 50%;
      display: grid; place-items: center; border: 2px solid var(--line);
      transition: background-color .2s, border-color .2s;
    }
    li[data-s=active] .m { border-top-color: var(--p); animation: spin .8s linear infinite; }
    li[data-s=done] .m { background: var(--p); border-color: var(--p); animation: pop .3s cubic-bezier(.16, 1, .3, 1); }
    li[data-s=error] .m { background: var(--bad); border-color: var(--bad); }
    li[data-s=error] { color: var(--bad); }
    svg { width: 12px; height: 12px; fill: none; stroke: #fff; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
    path { stroke-dasharray: 14; stroke-dashoffset: 14; transition: stroke-dashoffset .3s .05s ease-out; }
    li[data-s=done] .ok, li[data-s=error] .x { stroke-dashoffset: 0; }
    .err { margin-top: 20px; font-size: 14px; color: var(--bad); }
    button {
      margin-top: 16px; width: 100%; height: 40px; border-radius: 10px;
      border: 1px solid var(--line); background: transparent; color: inherit;
      font: inherit; font-weight: 600; cursor: pointer; transition: background-color .15s;
    }
    button:hover { background: hsl(30 20% 50% / .08); }
    button:focus-visible { outline: 2px solid var(--p); outline-offset: 2px; }
    [hidden] { display: none; }
    @keyframes fade { from { opacity: 0; } }
    @keyframes rise { from { opacity: 0; transform: translateY(10px) scale(.97); filter: blur(6px); } }
    @keyframes spin { to { transform: rotate(1turn); } }
    @keyframes grow { from { transform: scaleY(0); } }
    @keyframes pop { from { transform: scale(.75); } }
    @keyframes pulse { 50% { opacity: .35; } }
    @media (prefers-reduced-motion: reduce) {
      .card { animation: fade .2s ease-out both; }
      li[data-s=active] .m { border-color: var(--p); animation: pulse 1.4s ease-in-out infinite; }
      li[data-s=done] .m, li[data-s=done]::after { animation: none; }
    }
  </style>
  <div class="wrap">
    <div class="scrim"></div>
    <div class="card" role="status" aria-live="polite">
      <h2>Signing you in</h2>
      <ol>${STEPS.map((s) => `<li>${mark}<span>${s}</span></li>`).join("")}</ol>
      <p class="err" hidden></p>
      <button type="button" hidden>Log in manually</button>
    </div>
  </div>`;
  document.documentElement.append(host);

  const items = root.querySelectorAll("li");
  const step = (i) =>
    items.forEach((li, j) => {
      if (j < i) li.dataset.s = "done";
      else if (j === i) li.dataset.s = "active";
      else delete li.dataset.s;
    });
  step(0);

  return {
    step,
    fail(msg) {
      root.querySelector("[data-s=active]")?.setAttribute("data-s", "error");
      const err = root.querySelector(".err");
      err.textContent = msg;
      err.hidden = false;
      const btn = root.querySelector("button");
      btn.hidden = false;
      btn.focus();
      btn.onclick = () => {
        root.querySelector(".wrap").classList.add("out");
        setTimeout(() => host.remove(), 150);
      };
    },
  };
};
