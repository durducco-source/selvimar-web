/* ==========================================================================
   SELVIMAR · FUNCIONAMIENTO DE LA WEB
   (Menú, animaciones, ventanas de servicio, galería, formulario y WhatsApp.)
   Normalmente NO necesitas tocar este archivo: los datos se cambian en config.js
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.SELVIMAR_CONFIG || {};
  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Lee un valor de la configuración: get("contacto.email") */
  function get(path) {
    return path.split(".").reduce(function (o, k) { return (o && o[k] != null) ? o[k] : undefined; }, CFG);
  }
  function safe(fn) { try { fn(); } catch (e) { if (window.console) console.warn("[SELVIMAR]", e); } }

  /* ---------- 1. Datos de contacto desde config.js ---------- */
  function waLink(text) {
    var num = String(get("contacto.whatsapp") || "").replace(/\D/g, "");
    var msg = text != null ? text : (get("contacto.whatsappMensaje") || "");
    return "https://wa.me/" + num + (msg ? "?text=" + encodeURIComponent(msg) : "");
  }
  function telHref(t) { return "tel:" + String(t || "").replace(/[^\d+]/g, ""); }

  function applyConfig() {
    $$("[data-cfg]").forEach(function (el) {
      var v = get(el.getAttribute("data-cfg"));
      if (v) el.textContent = v;
    });
    $$("[data-cfg-href]").forEach(function (el) {
      var v = get(el.getAttribute("data-cfg-href"));
      if (v) el.setAttribute("href", v);
    });
    $$("[data-show-if]").forEach(function (el) {
      var v = get(el.getAttribute("data-show-if"));
      el.hidden = !v;
    });
    $$("[data-wa]").forEach(function (a) { a.setAttribute("href", waLink()); });
    $$("[data-tel]").forEach(function (a) {
      var t = get("contacto.telefono");
      if (t) { a.setAttribute("href", telHref(t)); if (a.hasAttribute("data-tel") && !a.children.length) a.textContent = t; }
    });
    $$("[data-tel-text]").forEach(function (a) { var t = get("contacto.telefono"); if (t) a.textContent = t; });
    $$("[data-tel2]").forEach(function (a) {
      var t = get("contacto.telefonoSecundario");
      var wrap = a.closest("[data-tel2-wrap]");
      if (t) { a.textContent = t; a.setAttribute("href", telHref(t)); } else if (wrap) { wrap.hidden = true; }
    });
    $$("[data-mail]").forEach(function (a) {
      var m = get("contacto.email"); if (m) { a.setAttribute("href", "mailto:" + m); a.textContent = m; }
    });
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

    /* Datos legales */
    var L = get("legal") || {}, complete = !!(L.razonSocial && L.nif && L.registroMercantil);
    $$("[data-legal]").forEach(function (el) {
      var v = L[el.getAttribute("data-legal")];
      if (v) { el.textContent = v; el.classList.remove("pending"); el.style.fontStyle = "normal"; }
    });
    $$("[data-todo-legal]").forEach(function (el) { el.hidden = complete; });

    /* Testimonios de ejemplo */
    if (get("resenas.testimoniosReales")) $$("[data-sample]").forEach(function (el) { el.hidden = true; });

    /* Reseñas de Google */
    var zone = $("[data-reviews]");
    if (zone) {
      var embed = $("#reviews-embed");
      var hasEmbed = embed && embed.children.length > 0;
      zone.hidden = !(get("resenas.enlaceGoogle") || hasEmbed);
    }

    /* Sobre nosotros: cifras y certificaciones reales (solo si se rellenan) */
    var facts = get("sobreNosotros.cifras"), fbox = $("[data-facts]");
    if (fbox && facts && facts.length) {
      fbox.innerHTML = "";
      facts.forEach(function (f) {
        var d = document.createElement("div"), b = document.createElement("b"), s = document.createElement("span");
        b.textContent = f.valor; s.textContent = f.etiqueta; d.appendChild(b); d.appendChild(s); fbox.appendChild(d);
      });
      fbox.hidden = false;
    }
    var certs = get("sobreNosotros.certificaciones"), cbox = $("[data-certs]");
    if (cbox && certs && certs.length) {
      cbox.innerHTML = "";
      certs.forEach(function (c) { var li = document.createElement("li"); li.textContent = c; cbox.appendChild(li); });
      cbox.hidden = false;
    }
  }

  /* Datos estructurados para Google (negocio local) */
  function injectSchema() {
    var s = document.createElement("script");
    s.type = "application/ld+json";
    var data = {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "name": get("empresa.nombre") || "SELVIMAR",
      "description": "Empresa de limpieza profesional en Lloret de Mar y Costa Brava: limpieza de hoteles, apartamentos turísticos, oficinas, comunidades, restaurantes, discotecas y limpieza de obra.",
      "knowsAbout": ["Limpieza de hoteles", "Limpieza de apartamentos turísticos", "Limpieza de oficinas", "Limpieza de comunidades", "Limpieza de restaurantes", "Limpieza de discotecas", "Limpieza de obra", "Servicios de limpieza profesional"],
      "url": get("empresa.url"),
      "telephone": "+34" + String(get("contacto.telefono") || "").replace(/\D/g, ""),
      "image": (get("empresa.url") || "") + "/assets/img/og-image.jpg",
      "address": { "@type": "PostalAddress", "streetAddress": "Calle Mercè Rodoreda, 1-3-5 (Local 3)", "postalCode": "17310", "addressLocality": "Lloret de Mar", "addressRegion": "Girona", "addressCountry": "ES" },
      "areaServed": ["Lloret de Mar", "Blanes", "Tossa de Mar", "Girona", "Costa Brava"]
    };
    var sameAs = [get("contacto.instagram"), get("contacto.facebook")].filter(Boolean);
    if (sameAs.length) data.sameAs = sameAs;
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }

  /* ---------- 2. Cabecera, menú móvil y sección activa ---------- */
  function initHeader() {
    var header = $(".header"), burger = $(".burger"), hero = $("[data-hero]"), lastY = window.scrollY;
    /* Sobre la portada la cabecera es transparente; después se vuelve clara y
       se esconde al bajar (reaparece al subir) para dejar todo el protagonismo al contenido. */
    var onScroll = function () {
      var y = window.scrollY;
      var limit = hero ? Math.max(40, hero.offsetTop + hero.offsetHeight - window.innerHeight * 1.35) : 40;
      header.classList.toggle("is-scrolled", y > limit);
      if (!document.body.classList.contains("nav-open")) {
        if (y > limit + 240 && y > lastY + 4) header.classList.add("is-hidden");
        else if (y < lastY - 4 || y <= limit) header.classList.remove("is-hidden");
      }
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    function setMenu(open) {
      document.body.classList.toggle("nav-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    }
    burger.addEventListener("click", function () { setMenu(!document.body.classList.contains("nav-open")); });
    $$(".nav a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    window.addEventListener("resize", function () { if (window.innerWidth > 1200) setMenu(false); });

    /* Resalta en el menú la sección que se está viendo */
    if (!("IntersectionObserver" in window)) return;
    var links = {};
    $$('.nav a[href*="#"]').forEach(function (a) { links[a.getAttribute("href").split("#")[1]] = a; });
    var map = { clientes: "servicios", "por-que": "nosotros", proceso: "nosotros", testimonios: "galeria", zona: "nosotros" };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = map[en.target.id] || en.target.id;
        $$(".nav a").forEach(function (a) { a.classList.remove("is-active"); });
        if (links[id]) links[id].classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach(function (s) { if (!s.classList.contains("legal") && s.id) io.observe(s); });
  }

  /* ---------- 3. Animaciones al hacer scroll ---------- */

  /* Divide un titular en palabras (respetando las cursivas) para que entren una a una */
  function splitWords(el, cls) {
    var n = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 1) { walk(ch); return; }
        if (ch.nodeType !== 3 || !ch.textContent.trim()) return;
        var frag = document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var w = document.createElement("span");
          if (cls) { w.className = cls; w.textContent = part; }
          else { w.className = "w"; w.style.setProperty("--wi", n); var inner = document.createElement("span"); inner.textContent = part; w.appendChild(inner); }
          n++; frag.appendChild(w);
        });
        node.replaceChild(frag, ch);
      });
    })(el);
    return n;
  }
  function initSplit() {
    $$(".title, h1[data-split]").forEach(function (el) { splitWords(el); el.classList.add("split"); });
    /* Las imágenes aparecen de forma progresiva (cortinilla) */
    $$(".svc-img, .gal, .frame, .aud-item").forEach(function (el, i) {
      el.classList.remove("reveal", "reveal--fade");
      el.classList.add("img-in");
      if (!el.style.getPropertyValue("--d")) el.style.setProperty("--d", ((i % 3) * 0.1).toFixed(2) + "s");
    });
  }

  function initReveal() {
    var items = $$(".reveal, [data-steps], .split:not(h1), .img-in");
    if (!("IntersectionObserver" in window) || reduce) { items.forEach(function (el) { el.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  /* Movimiento ligado al scroll: portada por escenas, parallax de imágenes,
     frase del manifiesto, banda de servicios, entrada de secciones oscuras y barra de progreso. */
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function initScrollFX() {
    var bar = $("[data-progress]");
    var words = [], mText = $("[data-words]");
    if (mText) { splitWords(mText, "mw"); words = $$(".mw", mText); }
    if (reduce) { words.forEach(function (w) { w.classList.add("is-on"); }); return; }

    var hero = $("[data-hero]"), frame = $("[data-hero-frame]"), content = $("[data-hero-content]");
    var scenes = $$("[data-scene]"), labels = $$(".hero-labels li"), sceneN = $("[data-scene-n]"), sceneBar = $("[data-scene-bar]");
    var cue = $(".hero-scroll");
    var pxImgs = $$(".svc-img img, .gal img, .frame img, .aud-item img");
    pxImgs.forEach(function (im) { im.classList.add("px"); });
    var darks = $$(".on-dark"), band = $("[data-band]");
    var HOLD = 0.8, STEP = HOLD / 4, FADE = 0.08;   /* 4 escenas en el 80 % del recorrido; el 20 % final encoge el marco */
    var lastScene = -1, ticking = false;

    function heroFX(vh) {
      if (!hero) return;
      var r = hero.getBoundingClientRect();
      if (r.bottom < 0) return;
      var p = clamp(-r.top / (hero.offsetHeight - vh));
      var cur = 0;
      scenes.forEach(function (s, i) {
        if (i === 0) { s.style.transform = "scale(" + (1 + 0.08 * clamp(p / (STEP * 2))).toFixed(4) + ")"; return; }
        var b = i * STEP, t = clamp((p - (b - FADE)) / (FADE * 2));
        var z = easeOut(clamp((p - (b - FADE)) / (STEP + FADE)));
        s.style.clipPath = "inset(" + ((1 - easeOut(t)) * 100).toFixed(2) + "% 0 0 0)";
        s.style.transform = "scale(" + (1.16 - 0.1 * z).toFixed(4) + ")";
        if (p >= b) cur = i;
      });
      if (cur !== lastScene) {
        lastScene = cur;
        if (sceneN) sceneN.textContent = "0" + (cur + 1);
        labels.forEach(function (l, i) { l.classList.toggle("is-active", i === cur); l.classList.toggle("is-past", i < cur); });
      }
      if (sceneBar) sceneBar.style.transform = "scaleX(" + clamp(p / HOLD).toFixed(4) + ")";
      /* Final: la imagen se encoge dentro de un marco, como una pantalla */
      var f = easeOut(clamp((p - HOLD) / (1 - HOLD)));
      var sx = window.innerWidth < 760 ? 4 : 6, sy = window.innerWidth < 760 ? 10 : 9;
      frame.style.clipPath = f > 0 ? "inset(" + (f * sy).toFixed(2) + "% " + (f * sx).toFixed(2) + "% round " + (f * 30).toFixed(1) + "px)" : "";
      content.style.opacity = (1 - clamp(f * 1.8)).toFixed(3);
      content.style.transform = f > 0 ? "translateY(" + (-f * 50).toFixed(1) + "px)" : "";
      if (cue) cue.style.opacity = (1 - clamp(p * 25)).toFixed(3);
    }

    function update() {
      ticking = false;
      var vh = window.innerHeight, y = window.scrollY;
      if (bar) bar.style.transform = "scaleX(" + clamp(y / (document.documentElement.scrollHeight - vh)).toFixed(4) + ")";
      heroFX(vh);

      pxImgs.forEach(function (im) {
        var box = im.parentNode.getBoundingClientRect();
        if (box.bottom < -100 || box.top > vh + 100) return;
        var off = (box.top + box.height / 2 - vh / 2) / (vh / 2 + box.height / 2);
        im.style.translate = "0 " + (-off * box.height * 0.06).toFixed(1) + "px";
      });

      if (words.length) {
        var mr = mText.getBoundingClientRect();
        var mp = clamp((vh * 0.85 - mr.top) / (vh * 0.85 - vh * 0.35 + mr.height * 0.6));
        var on = Math.round(mp * words.length);
        words.forEach(function (w, i) { w.classList.toggle("is-on", i < on); });
      }

      if (band) {
        var br = band.getBoundingClientRect();
        if (br.bottom > 0 && br.top < vh) {
          var bp = (vh - br.top) / (vh + br.height);
          band.style.transform = "translate3d(" + (-bp * Math.max(0, band.scrollWidth - window.innerWidth * 0.6)).toFixed(1) + "px,0,0)";
        }
      }

      darks.forEach(function (d) {
        var t = d.getBoundingClientRect().top;
        if (t > vh * 1.1 || t < -vh) return;
        d.style.setProperty("--in", clamp((vh * 0.92 - t) / (vh * 0.7)).toFixed(3));
      });
    }
    function request() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    update();
  }

  /* ---------- 4. Ventanas de "Más información" ---------- */
  function openDialog(d) { if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", ""); document.documentElement.style.overflow = "hidden"; }
  function closeDialog(d) { if (typeof d.close === "function") d.close(); else d.removeAttribute("open"); document.documentElement.style.overflow = ""; }
  function wireDialog(d) {
    d.addEventListener("close", function () { document.documentElement.style.overflow = ""; });
    d.addEventListener("click", function (e) { if (e.target === d) closeDialog(d); });   /* clic en el fondo */
    $$("[data-close]", d).forEach(function (b) { b.addEventListener("click", function () { closeDialog(d); }); });
  }

  var currentService = "";
  function selectService(name) {
    var sel = $("#f-servicio"); if (!sel) return;
    var opts = $$("option", sel), i;
    for (i = 0; i < opts.length; i++) if (opts[i].textContent === name) { sel.value = opts[i].value || opts[i].textContent; break; }
  }
  function initServices() {
    var modal = $("#svc-modal"); if (!modal) return;
    wireDialog(modal);
    $$(".svc").forEach(function (card) {
      var btn = $("[data-more]", card);
      function open() {
        var name = card.getAttribute("data-service");
        currentService = name;
        $("#svc-modal-title").textContent = name;
        $("#svc-modal-text").innerHTML = $(".svc-more", card).innerHTML;
        var im = $("#svc-modal-img"); im.src = card.getAttribute("data-img"); im.alt = $("img", card).alt;
        $("#svc-modal-wa").setAttribute("href", waLink("Hola, me gustaría solicitar un presupuesto de: " + name + "."));
        openDialog(modal);
      }
      btn.addEventListener("click", open);
      $(".svc-img", card).style.cursor = "pointer";
      $(".svc-img", card).addEventListener("click", open);
    });
    $("#svc-modal-quote").addEventListener("click", function (e) {
      e.preventDefault(); closeDialog(modal); selectService(currentService);
      var t = $("#contacto"); if (t) t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      setTimeout(function () { var n = $("#f-nombre"); if (n) n.focus({ preventScroll: true }); }, 700);
    });
  }

  /* ---------- 5. Galería con ampliación ---------- */
  function initGallery() {
    var lb = $("#lightbox"); if (!lb) return;
    wireDialog(lb);
    var items = $$(".gal"), idx = 0;
    function show(i) {
      idx = (i + items.length) % items.length;
      var it = items[idx];
      var im = $("#lb-img"); im.src = it.getAttribute("data-full"); im.alt = $("img", it).alt;
      $("#lb-cap").textContent = it.getAttribute("data-cap");
    }
    items.forEach(function (it, i) { it.addEventListener("click", function () { show(i); openDialog(lb); }); });
    $("[data-prev]", lb).addEventListener("click", function () { show(idx - 1); });
    $("[data-next]", lb).addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* Antes y después */
  function initBeforeAfter() {
    var box = $("[data-ba]"); if (!box) return;
    var range = $(".ba-range", box);
    function set(v) { box.style.setProperty("--pos", v + "%"); }
    range.addEventListener("input", function () { set(range.value); });
    set(range.value);
  }

  /* ---------- 6. Formulario de presupuesto ---------- */
  function initForm() {
    var form = $("#quote-form"); if (!form) return;
    var msg = $("#form-msg"), btn = $("button[type=submit]", form);

    function show(text, err) { msg.textContent = text; msg.classList.toggle("is-err", !!err); msg.hidden = false; msg.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
    function fieldOf(el) { return el.closest(".field") || el.closest(".consent"); }
    function validate() {
      var ok = true, first = null;
      $$("[required]", form).forEach(function (el) {
        var valid = el.type === "checkbox" ? el.checked : el.value.trim() !== "";
        if (valid && el.type === "email") valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
        if (valid && el.type === "tel") valid = el.value.replace(/\D/g, "").length >= 9;
        var f = fieldOf(el); if (f) f.classList.toggle("has-error", !valid);
        el.setAttribute("aria-invalid", valid ? "false" : "true");
        if (!valid) { ok = false; if (!first) first = el; }
      });
      if (first) first.focus();
      return ok;
    }
    $$("input, select, textarea", form).forEach(function (el) {
      el.addEventListener("input", function () { var f = fieldOf(el); if (f) f.classList.remove("has-error"); });
      el.addEventListener("change", function () { var f = fieldOf(el); if (f) f.classList.remove("has-error"); });
    });

    function collect() {
      var d = {}; $$("input, select, textarea", form).forEach(function (el) {
        if (el.name && el.name !== "privacidad" && el.name !== "_gotcha") d[el.name] = el.value.trim();
      }); return d;
    }
    var LABELS = { nombre: "Nombre", telefono: "Teléfono", email: "Email", empresa: "Empresa", tipo_establecimiento: "Tipo de establecimiento", servicio: "Servicio", frecuencia: "Frecuencia", fecha: "Fecha aproximada", zona: "Zona", mensaje: "Mensaje" };
    function asText(d) {
      var lines = ["Hola, me gustaría solicitar un presupuesto."];
      Object.keys(LABELS).forEach(function (k) { if (d[k]) lines.push(LABELS[k] + ": " + d[k]); });
      return lines.join("\n");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      msg.hidden = true;
      if ($("[name=_gotcha]", form).value) return;              /* anti-spam: los robots rellenan este campo */
      if (!validate()) { show("Revisa los campos marcados para poder enviar tu solicitud.", true); return; }

      var data = collect(), endpoint = get("formulario.endpoint");
      if (endpoint) {
        btn.disabled = true; var old = btn.textContent; btn.textContent = "Enviando…";
        fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(data) })
          .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json().catch(function () { return {}; }); })
          .then(function () { form.reset(); show("¡Gracias! Hemos recibido tu solicitud y te responderemos lo antes posible.", false); })
          .catch(function () { show("No hemos podido enviar el formulario. Inténtalo de nuevo o escríbenos por WhatsApp.", true); })
          .then(function () { btn.disabled = false; btn.textContent = old; });
        return;
      }
      /* Sin servicio de formularios configurado: preparamos el mensaje por WhatsApp o correo */
      var text = asText(data);
      if (get("formulario.alternativa") === "email" && get("contacto.email")) {
        window.location.href = "mailto:" + get("contacto.email") + "?subject=" + encodeURIComponent("Solicitud de presupuesto") + "&body=" + encodeURIComponent(text);
        show("Se ha abierto tu programa de correo con la solicitud preparada. Solo tienes que enviarla.", false);
      } else {
        window.open(waLink(text), "_blank", "noopener");
        show("Se ha abierto WhatsApp con tu solicitud ya escrita. Solo tienes que pulsar enviar.", false);
      }
    });
  }

  /* Los botones "Solicitar presupuesto" llevan al formulario */
  function initCTAs() {
    $$("[data-cta]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        var href = a.getAttribute("href") || "";
        if (href.indexOf("#contacto") === -1) return;
        var t = $("#contacto"); if (!t) return;
        e.preventDefault(); t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
        history.replaceState(null, "", "#contacto");
      });
    });
  }

  /* ---------- 7. Aviso de cookies ---------- */
  function initCookie() {
    var box = $("#cookie"); if (!box) return;
    var done = false; try { done = localStorage.getItem("selvimar_cookie_ok") === "1"; } catch (e) {}
    if (!done) box.hidden = false;
    $("#cookie-ok").addEventListener("click", function () { box.hidden = true; try { localStorage.setItem("selvimar_cookie_ok", "1"); } catch (e) {} });
  }

  /* ---------- Arranque ---------- */
  function init() {
    safe(applyConfig); safe(injectSchema); safe(initHeader); safe(initSplit); safe(initReveal); safe(initScrollFX);
    safe(initServices); safe(initGallery); safe(initBeforeAfter); safe(initForm); safe(initCTAs); safe(initCookie);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
