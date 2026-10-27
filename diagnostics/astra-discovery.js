/* VOIDWARE ASTRA • Read-only Runtime Discovery V1.0
 * Reads public DOM structure and runtime property metadata only.
 * Does not modify gameplay, listen for network packets, inspect credentials, or cheat.
 * Run from DevTools Console while an Astra Strike bot match is active.
 */
(() => {
  "use strict";
  if (!/(^|\.)astrastrike\.fun$/i.test(location.hostname)) {
    console.warn("[VOIDWARE ASTRA] Open astrastrike.fun before running diagnostics.");
    return;
  }

  function safe(fn, fallback = null) {
    try { return fn(); } catch { return fallback; }
  }
  function propNames(object) {
    return safe(() => Reflect.ownKeys(object).map(String).slice(0, 100), []);
  }
  function metadata(object) {
    if (!object || (typeof object !== "object" && typeof object !== "function")) {
      return { present: !!object, type: typeof object, ownProperties: [], prototypes: [] };
    }
    const ownProperties = safe(() => Reflect.ownKeys(object).slice(0, 100).map(key => {
      const descriptor = Object.getOwnPropertyDescriptor(object, key);
      return {
        key: String(key),
        kind: descriptor && "value" in descriptor ? typeof descriptor.value : "accessor",
        enumerable: !!descriptor?.enumerable
      };
    }), []);
    const prototypes = [];
    let cursor = safe(() => Object.getPrototypeOf(object));
    for (let depth = 1; cursor && depth <= 4; depth++) {
      prototypes.push({ depth, keys: propNames(cursor) });
      cursor = safe(() => Object.getPrototypeOf(cursor));
    }
    return { present: true, type: typeof object, ownProperties, prototypes };
  }

  const ids = [
    "game", "scene", "hud", "hpVal", "armorVal", "ammoVal",
    "reserveVal", "timer", "scoreboard", "crosshair", "radar",
    "killfeed", "scope", "menu", "playBtn", "sens", "gfxScale",
    "gfxFps", "gfxAa", "gfxMeter", "gfxShadows"
  ];
  const dom = Object.fromEntries(ids.map(id => [id, !!document.getElementById(id)]));
  const scripts = [...document.scripts].map(script => ({
    type: script.type || "classic",
    path: script.src ? safe(() => new URL(script.src).pathname, "(unknown)") : "(inline)",
    inlineBytes: script.src ? 0 : script.textContent.length
  })).slice(0, 60);
  const loadedJS = [...new Set(
    performance.getEntriesByType("resource")
      .filter(r => /\.m?js(?:\?|$)/i.test(r.name))
      .map(r => safe(() => new URL(r.name).pathname))
      .filter(Boolean)
  )].slice(0, 60);

  const report = {
    tool: "VOIDWARE ASTRA runtime discovery",
    version: "1.0",
    domain: location.hostname,
    pagePath: location.pathname,
    localGame: metadata(window.game),
    dom,
    scripts,
    loadedJS
  };

  console.group("[VOIDWARE ASTRA] READ-ONLY DIAGNOSTICS");
  console.log("Game global:", report.localGame);
  console.table(Object.entries(dom).map(([id, exists]) => ({id, exists})));
  console.table(scripts);
  console.log("Diagnostic file has no cookies, tokens, messages or network data.");
  console.groupEnd();

  const blob = new Blob([JSON.stringify(report, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "VOIDWARE_ASTRA_DIAGNOSTICS.json";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return report;
})();
