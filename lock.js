// Schermata di accesso: l'app è cifrata (AES-256-GCM) in app.enc e si apre solo con il codice giusto.
// La chiave si ricava dal codice con PBKDF2-SHA256: il codice non è scritto da nessuna parte nel sito.
(() => {
  "use strict";
  if (window.top !== window.self) { document.body.textContent = "Banco IBA non può essere aperto dentro un'altra pagina."; return; }
  if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));

  const SAVED = "banco-iba-chiave";
  const $ = id => document.getElementById(id);
  const b64d = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const b64e = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const normal = code => code.normalize("NFC").toLowerCase().replace(/[\s-]/g, "");
  let pkg = null, fails = 0;

  async function getPkg() {
    if (!pkg) {
      const r = await fetch("app.enc", { cache: "no-cache" });
      if (!r.ok) throw new Error("rete");
      pkg = await r.json();
    }
    return pkg;
  }
  async function derive(code, p) {
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(normal(code)), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt: b64d(p.salt), iterations: p.iter, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, true, ["decrypt"]);
  }
  async function decrypt(key, p) {
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64d(p.iv) }, key, b64d(p.ct));
    return JSON.parse(new TextDecoder().decode(plain));
  }
  function mount(app) {
    // Il contenuto è autenticato da AES-GCM: se fosse stato alterato, la decifratura avrebbe fallito.
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = URL.createObjectURL(new Blob([app.css], { type: "text/css" }));
    css.onload = () => {
      $("lock").remove();
      document.body.insertAdjacentHTML("beforeend", app.html);
      const js = document.createElement("script");
      js.src = URL.createObjectURL(new Blob([app.js], { type: "text/javascript" }));
      document.body.appendChild(js);
    };
    document.head.appendChild(css);
  }
  function say(text, bad) { const m = $("msg"); m.textContent = text; m.classList.toggle("bad", !!bad); }
  const wait = ms => new Promise(r => setTimeout(r, ms));

  async function tryCode(e) {
    e.preventDefault();
    const code = $("code").value;
    if (normal(code).length < 4) return say("Scrivi il codice di accesso.", true);
    $("go").disabled = true; say("Controllo il codice…");
    try {
      const p = await getPkg();
      const key = await derive(code, p);
      const app = await decrypt(key, p);
      if ($("remember").checked) {
        try { localStorage.setItem(SAVED, JSON.stringify({ salt: p.salt, k: b64e(await crypto.subtle.exportKey("raw", key)) })); } catch (_) {}
      }
      fails = 0; mount(app);
    } catch (err) {
      fails++;
      await wait(Math.min(8000, 600 * 2 ** fails)); // ogni errore allunga l'attesa
      say(err && err.message === "rete" ? "Non riesco a caricare l'app. Controlla la connessione e riprova." : "Codice non corretto. Riprova.", true);
      $("go").disabled = false; $("code").select();
    }
  }

  async function autoOpen() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(SAVED)); } catch (_) {}
    if (!saved || typeof saved.k !== "string") return;
    try {
      const p = await getPkg();
      if (saved.salt !== p.salt) throw 0; // codice cambiato: va reinserito
      const key = await crypto.subtle.importKey("raw", b64d(saved.k), "AES-GCM", false, ["decrypt"]);
      mount(await decrypt(key, p));
    } catch (_) {
      try { localStorage.removeItem(SAVED); } catch (__) {}
    }
  }

  $("form").addEventListener("submit", tryCode);
  $("show").addEventListener("change", e => { $("code").type = e.target.checked ? "text" : "password"; });
  autoOpen();
})();
