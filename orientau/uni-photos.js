/* ============================================================
   OrientaU – Fotos reales de campus (uni-photos.js)

   Cómo funciona (en orden, para cada universidad):
   1) UNI_PHOTOS  → tu lista manual de links (la más confiable).
   2) UNI_CAMPUS  → los links que ya estaban en app.js (si cargan).
   3) Wikipedia   → busca sola la foto principal del artículo de la
                    universidad (solo fotos .jpg libres, no logos).
   4) Si nada funciona, la tarjeta muestra su degradado con el icono.

   Para forzar una foto específica, agrégala abajo con el nombre
   EXACTO de la universidad (igual que en app.js) y el link.
   ============================================================ */
(function () {
  'use strict';

  // ── 1) LISTA MANUAL ────────────────────────────────────────
  // Formato:  "Nombre exacto": "https://link-de-la-foto.jpg",
  window.UNI_PHOTOS = window.UNI_PHOTOS || {
    // "Universidad de los Andes": "https://upload.wikimedia.org/....jpg",
  };

  var CACHE_KEY = 'orientau_uniphotos_v1';
  var HIT_TTL   = 1000 * 60 * 60 * 24 * 30; // fotos encontradas: 30 días
  var MISS_TTL  = 1000 * 60 * 60 * 24 * 2;  // búsquedas fallidas: 2 días

  // ── Caché en el navegador (para no repetir búsquedas) ──────
  function readCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function writeCache(c) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch (e) {}
  }
  function cacheGet(name) {
    var e = readCache()[name];
    if (!e) return undefined;
    var ttl = e.u ? HIT_TTL : MISS_TTL;
    if (Date.now() - e.t > ttl) return undefined;
    return e.u;
  }
  function cacheSet(name, url) {
    var c = readCache();
    c[name] = { u: url || '', t: Date.now() };
    writeCache(c);
  }

  // ── Utilidades de texto ────────────────────────────────────
  function norm(s) {
    return String(s || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ').trim();
  }
  function expandName(name) {
    return String(name || '')
      .replace(/\bU\.\s*/g, 'Universidad ')
      .replace(/\bUniv\.\s*/g, 'Universidad ')
      .replace(/\bCorp\.\s*/g, 'Corporación ')
      .replace(/\bInst\.\s*/g, 'Institución ')
      .replace(/\s+/g, ' ').trim();
  }
  var STOP = { universidad:1, universitaria:1, universitario:1, corporacion:1, fundacion:1,
               institucion:1, de:1, del:1, la:1, las:1, los:1, el:1, y:1, en:1, colombia:1,
               colombiana:0, pontificia:1, san:0 };
  function keyTokens(name) {
    return norm(expandName(name)).split(' ').filter(function (t) {
      return t.length > 2 && !STOP[t];
    });
  }
  // La página encontrada debe compartir al menos una palabra distintiva
  // con el nombre de la universidad (evita fotos de otra cosa).
  function isRelevant(title, name) {
    var toks = keyTokens(name);
    if (!toks.length) return true;
    var t = ' ' + norm(title) + ' ';
    return toks.some(function (k) { return t.indexOf(' ' + k) !== -1; });
  }
  function isJpg(url) { return /\.jpe?g(\?|$)/i.test(url || ''); }

  // ── Cola simple (máx. 3 búsquedas a la vez) ────────────────
  var running = 0, waiting = [];
  function enqueue(fn) {
    return new Promise(function (resolve) {
      function run() {
        running++;
        Promise.resolve().then(fn).then(resolve, function () { resolve(null); })
          .then(function () { running--; if (waiting.length) waiting.shift()(); });
      }
      if (running < 3) run(); else waiting.push(run);
    });
  }

  // ── Búsqueda en Wikipedia (foto principal del artículo) ────
  function pickFromWikiResponse(json, name) {
    var pages = json && json.query && json.query.pages;
    if (!pages) return null;
    var list = Object.keys(pages).map(function (k) { return pages[k]; })
      .sort(function (a, b) { return (a.index || 99) - (b.index || 99); });
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      var src = p.thumbnail && p.thumbnail.source;
      if (src && isJpg(src) && isRelevant(p.title, name)) return src;
    }
    return null;
  }
  function wikiLookup(name, city) {
    var q = expandName(name) + ' ' + (city || '');
    var url = 'https://es.wikipedia.org/w/api.php?action=query&format=json&origin=*' +
      '&generator=search&gsrnamespace=0&gsrlimit=6&gsrsearch=' + encodeURIComponent(q) +
      '&prop=pageimages&piprop=thumbnail&pithumbsize=720&redirects=1';
    return fetch(url).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { return pickFromWikiResponse(j, name); })
      .catch(function () { return null; });
  }

  // ── Probar que un link de imagen realmente carga ───────────
  function testImage(url) {
    return new Promise(function (resolve) {
      if (!url) return resolve(false);
      var img = new Image(), done = false;
      function end(ok) { if (!done) { done = true; resolve(ok); } }
      img.onload  = function () { end(true); };
      img.onerror = function () { end(false); };
      img.referrerPolicy = 'no-referrer';
      setTimeout(function () { end(false); }, 9000);
      img.src = url;
    });
  }

  // ── Resolver la mejor foto para una universidad ────────────
  var memo = {};
  function resolve(name, city) {
    if (memo[name]) return memo[name];
    memo[name] = (async function () {
      var manual = window.UNI_PHOTOS && window.UNI_PHOTOS[name];
      if (manual && await testImage(manual)) return manual;

      var cached = cacheGet(name);
      if (cached !== undefined) return cached || null;

      var legacy = (typeof UNI_CAMPUS !== 'undefined') ? UNI_CAMPUS[name] : null;
      if (legacy && await testImage(legacy)) { cacheSet(name, legacy); return legacy; }

      var wiki = await enqueue(function () { return wikiLookup(name, city); });
      if (wiki && await testImage(wiki)) { cacheSet(name, wiki); return wiki; }

      cacheSet(name, '');
      return null;
    })();
    return memo[name];
  }

  // ── Poner la foto dentro de la tarjeta ─────────────────────
  async function hydrate(el) {
    if (!el || el.dataset.upState) return;
    el.dataset.upState = 'loading';
    var url = await resolve(el.dataset.uni, el.dataset.city || '');
    if (!url) { el.dataset.upState = 'none'; return; }
    var img = document.createElement('img');
    img.className = 'uni-photo-img';
    img.alt = '';
    img.decoding = 'async';
    img.referrerPolicy = 'no-referrer';
    img.onload = function () {
      el.classList.add('has-photo');
      if (el.parentElement) el.parentElement.classList.add('has-uni-photo');
    };
    img.onerror = function () { img.remove(); el.dataset.upState = 'none'; };
    img.src = url;
    el.insertBefore(img, el.firstChild);
    el.dataset.upState = 'done';
  }

  // ── Cargar solo lo que se ve en pantalla ───────────────────
  var io = ('IntersectionObserver' in window)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { io.unobserve(en.target); hydrate(en.target); }
        });
      }, { rootMargin: '240px' })
    : null;

  function watch(el) {
    if (!el.dataset.uni || el.dataset.upState || el.dataset.upWatch) return;
    el.dataset.upWatch = '1';
    if (io) io.observe(el); else hydrate(el);
  }
  function scan(root) {
    if (!root || root.nodeType !== 1) return;
    if (root.matches && root.matches('.uni-photo[data-uni]')) watch(root);
    if (root.querySelectorAll) root.querySelectorAll('.uni-photo[data-uni]').forEach(watch);
  }

  function start() {
    scan(document.body);
    new MutationObserver(function (muts) {
      muts.forEach(function (m) { m.addedNodes.forEach(scan); });
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  window.UniPhotos = {
    resolve: resolve, hydrate: hydrate, scan: scan,
    _t: { pickFromWikiResponse: pickFromWikiResponse, isRelevant: isRelevant, isJpg: isJpg,
          expandName: expandName, keyTokens: keyTokens }
  };
})();
