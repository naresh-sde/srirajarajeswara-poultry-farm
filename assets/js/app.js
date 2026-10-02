/* =========================================================
   Sri Rajarajeswara Poultry Farm — app logic
   Vanilla JS, no dependencies, no build step.
   ========================================================= */
(function () {
  "use strict";

  var CFG = window.SRR_CONFIG || {};
  var DEFAULTS = window.SRR_DEFAULTS || {};
  var LEADS_KEY = "srrp_leads_v1";
  var UI_KEY = "srrp_ui_v1";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var inr = function (n) {
    var v = Math.round(n * 100) / 100;
    var s = String(v);
    if (s.indexOf(".") > -1) { s = s.replace(/0$/, ""); }
    return (CFG.currency || "₹") + s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  var num = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); };

  function deepMerge(base, over) {
    var out = {}, k;
    for (k in base) { if (Object.prototype.hasOwnProperty.call(base, k)) out[k] = base[k]; }
    for (k in over) {
      if (!Object.prototype.hasOwnProperty.call(over, k)) continue;
      if (over[k] && typeof over[k] === "object" && !Array.isArray(over[k]) && base[k] && typeof base[k] === "object") {
        out[k] = deepMerge(base[k], over[k]);
      } else { out[k] = over[k]; }
    }
    return out;
  }

  function loadUI() {
    try { return JSON.parse(localStorage.getItem(UI_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveUI(obj) {
    try { localStorage.setItem(UI_KEY, JSON.stringify(obj)); } catch (e) {}
  }

  /* ---------- merge saved overrides into config ---------- */
  var overrides = window.SRR_readOverrides ? window.SRR_readOverrides() : {};
  if (Object.keys(overrides).length) CFG = deepMerge(DEFAULTS, overrides);
  window.CFG = CFG;

  /* =========================================================
     1. Binding: text + link values from config
     ========================================================= */
  var WA_MSGS = {
    general: "Hello Sri Rajarajeswara Poultry Farm, I would like to know your bulk egg rates and today's availability.",
    quote: "Hello Sri Rajarajeswara Poultry Farm, I want a bulk egg quote. Please share today's rate card and availability.",
    tray: "Hello, I would like to order 30-egg trays. Please share today's rate and availability.",
    carton: "Hello, I would like to order 180-egg wholesale cartons. Please share today's rate and availability.",
    bulk: "Hello, I want to discuss a bulk / pallet egg supply contract. Please share your best rate and monthly terms.",
    marigold: "Hello, I would like to order marigold gold-yolk trays. Please share availability and rate.",
    contract: "Hello, I am interested in a daily egg supply contract for my hotel / kitchen. Please share rates and delivery slots.",
    manure: "Hello, I would like to order composted poultry manure. Please share rate and minimum quantity.",
    rates: "Hello, please send me today's confirmed bulk egg rate card — trays, cartons and pallet rates.",
    availability: "Hello, please confirm today's egg availability and dispatch time.",
    social: "Hello Sri Rajarajeswara Poultry Farm, I found you on Google and would like to know your bulk egg rates."
  };

  function waLink(msg) {
    return "https://wa.me/" + (CFG.whatsapp || "917095671881") + "?text=" + encodeURIComponent(msg || WA_MSGS.general);
  }

  function priceMap() {
    var p = CFG.products || {};
    return {
      trayPrice: Math.round((p.tray ? p.tray.rate * p.tray.qty : 210)),
      trayMrp: Math.round((CFG.retailPack ? CFG.retailPack.mrp : 7.9) * (p.tray ? p.tray.qty : 30)),
      cartonPrice: Math.round((p.carton ? p.carton.rate * p.carton.qty : 1125)),
      marigoldPrice: Math.round((p.marigold ? p.marigold.rate * p.marigold.qty : 225)),
      bulkRate: (p.bulk ? p.bulk.rate : 4.55)
    };
  }

  function bindAll() {
    var prices = priceMap();
    var map = {
      phone: CFG.phone,
      phoneDisplay: CFG.phoneDisplay,
      email: CFG.email,
      addressLine: CFG.addressLine,
      city: CFG.city,
      serviceArea: CFG.serviceArea,
      founder: CFG.founder,
      eggsPerDay: num(CFG.eggsPerDay),
      birds: num(CFG.birds),
      trayPrice: inr(prices.trayPrice),
      trayMrp: inr(prices.trayMrp),
      cartonPrice: inr(prices.cartonPrice),
      marigoldPrice: inr(prices.marigoldPrice),
      bulkRate: inr(prices.bulkRate)
    };
    $$("[data-bind]").forEach(function (el) {
      var key = el.getAttribute("data-bind");
      if (map[key] !== undefined) el.textContent = String(map[key]);
    });

    var tel = "+91" + (CFG.phone || "7095671881");
    $$('a[href^="tel:"]').forEach(function (a) { a.setAttribute("href", "tel:" + tel); });
    $$('a[href^="mailto:"]').forEach(function (a) { a.setAttribute("href", "mailto:" + CFG.email); });

    $$("[data-wa]").forEach(function (a) {
      var key = a.getAttribute("data-wa");
      a.setAttribute("href", waLink(WA_MSGS[key] || WA_MSGS.general));
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    });

    /* hours */
    var hl = $("#hoursList");
    if (hl && CFG.hours) {
      hl.innerHTML = "";
      CFG.hours.forEach(function (row) {
        var d = document.createElement("div");
        d.className = "hours-row";
        d.innerHTML = "<span></span><span></span>";
        d.children[0].textContent = row[0];
        d.children[1].textContent = row[1];
        hl.appendChild(d);
      });
    }

    /* dynamic structured data */
    var ld = $("#ld-dynamic");
    if (ld) {
      ld.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: CFG.farmName,
        telephone: "+91-" + CFG.phone,
        email: CFG.email,
        address: { "@type": "PostalAddress", addressLocality: "Telangana", addressRegion: "Telangana", addressCountry: "IN", streetAddress: CFG.addressLine },
        priceRange: "₹₹",
        makesOffer: [
          { "@type": "Offer", name: "30-egg tray", price: String(Math.round(prices.trayPrice)), priceCurrency: "INR" },
          { "@type": "Offer", name: "180-egg carton", price: String(Math.round(prices.cartonPrice)), priceCurrency: "INR" },
          { "@type": "Offer", name: "Bulk per egg", price: String(prices.bulkRate), priceCurrency: "INR" }
        ]
      });
    }
  }

  /* =========================================================
     2. Toast
     ========================================================= */
  var toastTimer;
  function toast(msg) {
    var t = $("#toast");
    if (!t) return;
    $("#toastMsg").textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 3200);
  }

  function copyText(text, okMsg) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { toast(okMsg || "Copied to clipboard"); });
      return;
    }
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); toast(okMsg || "Copied to clipboard"); }
    catch (e) { toast("Could not copy — please copy manually"); }
    document.body.removeChild(ta);
  }

  /* =========================================================
     3. Theme
     ========================================================= */
  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem("srrp_theme"); } catch (e) {}
    if (!saved && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) saved = "dark";
    applyTheme(saved || "light");

    var btn = $("#themeBtn");
    if (btn) btn.addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("srrp_theme", next); } catch (e) {}
    });
  }
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "dark" ? "#05150F" : "#0F3A2E");
  }

  /* =========================================================
     4. Header, progress, back-to-top, drawer
     ========================================================= */
  function initChrome() {
    var header = $("#header"), bar = $("#progress"), toTop = $("#toTop");

    function onScroll() {
      var y = window.scrollY || document.documentElement.scrollTop;
      if (header) header.classList.toggle("scrolled", y > 12);
      if (toTop) toTop.classList.toggle("show", y > 520);
      if (bar) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (toTop) toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    var drawer = $("#drawer"), overlay = $("#overlay"), burger = $("#burger");
    function closeDrawer() {
      if (drawer) drawer.classList.remove("open");
      if (overlay) overlay.classList.remove("show");
      if (burger) burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
    function openDrawer() {
      if (drawer) drawer.classList.add("open");
      if (overlay) overlay.classList.add("show");
      if (burger) burger.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }
    if (burger) burger.addEventListener("click", function () {
      drawer && drawer.classList.contains("open") ? closeDrawer() : openDrawer();
    });
    if ($("#drawerClose")) $("#drawerClose").addEventListener("click", closeDrawer);
    if (overlay) overlay.addEventListener("click", closeDrawer);
    $$("#drawer a").forEach(function (a) { a.addEventListener("click", closeDrawer); });

    window.__closeDrawer = closeDrawer;
    window.__openDrawer = openDrawer;

    /* scrollspy */
    var links = $$("#nav a");
    var sections = links.map(function (a) { return document.querySelector(a.getAttribute("href")); }).filter(Boolean);
    if ("IntersectionObserver" in window && sections.length) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          links.forEach(function (l) {
            l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id);
          });
        });
      }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
      sections.forEach(function (s) { spy.observe(s); });
    }
  }

  /* =========================================================
     5. Reveal + counters
     ========================================================= */
  var ui = loadUI();
  function initReveal() {
    if (ui.reveal === false) {
      $$(".reveal").forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var els = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  function indianFormat(n) {
    var s = String(n), out = "", count = 0;
    for (var i = s.length - 1; i >= 0; i--) {
      out = s.charAt(i) + out;
      count++;
      if (count === 3 && i > 0) { out = "," + out; count = 0; }
    }
    return out;
  }

  function initCounters() {
    var els = $$("[data-count]");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, target = parseFloat(el.getAttribute("data-count")) || 0;
        var suffix = el.getAttribute("data-suffix") || "";
        var dur = 1500, t0 = null;
        function step(ts) {
          if (!t0) t0 = ts;
          var pr = Math.min((ts - t0) / dur, 1);
          var eased = 1 - Math.pow(1 - pr, 3);
          var val = Math.round(target * eased);
          el.textContent = (el.getAttribute("data-format") === "in" ? indianFormat(val) : num(val)) + suffix;
          if (pr < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* =========================================================
     6. Bulk order calculator
     ========================================================= */
  function initCalc() {
    var form = $("#calcForm");
    if (!form) return;

    var state = { pack: "tray", packs: 10, freq: 1, fee: 150 };

    var PACKS = {
      tray: function () { return CFG.products.tray || { qty: 30, rate: 7 }; },
      carton: function () { return CFG.products.carton || { qty: 180, rate: 6.25 }; },
      marigold: function () { return CFG.products.marigold || { qty: 30, rate: 7.5 }; },
      bulk: function () { return CFG.products.bulk || { qty: 5400, rate: 4.55 }; }
    };
    var PACK_LABEL = { tray: "trays", carton: "cartons", marigold: "gold yolk trays", bulk: "pallet loads" };

    function slabFor(trays) {
      var slabs = CFG.slabs || [];
      for (var i = slabs.length - 1; i >= 0; i--) {
        if (trays >= slabs[i].min) return slabs[i];
      }
      return slabs[0] || { rate: 7, label: "Trial", tag: "Trial" };
    }

    function render() {
      var p = PACKS[state.pack]();
      var eggs = p.qty * state.packs;
      var trays = Math.ceil(eggs / 30);
      var slab = slabFor(trays);
      var rate = Math.min(p.rate, slab.rate);
      var goods = Math.round(eggs * rate);
      var retail = Math.round(eggs * (CFG.retailPack ? CFG.retailPack.mrp : 7.9));
      var save = Math.max(0, retail - goods);
      var delivery = goods >= (CFG.freeDeliveryAbove || 3000) ? 0 : state.fee;
      var total = goods + delivery;
      var pct = Math.min(100, (eggs / (CFG.eggsPerDay || 20000)) * 100);
      var loads = Math.max(1, Math.ceil(eggs / 5400));

      $("#estDesc").textContent = state.packs + " " + PACK_LABEL[state.pack] + " × " + p.qty + " eggs";
      $("#estEggs").textContent = num(eggs);
      $("#estRate").textContent = inr(rate) + " / egg";
      $("#estSlab").textContent = slab.label;
      $("#estGoods").textContent = inr(goods);
      $("#estDelivery").textContent = delivery ? inr(delivery) : "Free";
      $("#estSave").textContent = inr(save);
      $("#estTotal").textContent = inr(total);
      $("#estMonthly").textContent = state.freq > 1 ? inr(total * state.freq) : num(loads);
      $("#estMonthlyLabel").textContent = state.freq > 1 ? "Per month" : "Vehicle loads";
      $("#estBar").style.width = Math.max(2, pct) + "%";
      $("#estCapacity").textContent = pct.toFixed(pct < 10 ? 1 : 0) + "% of today's " + num(CFG.eggsPerDay) + " egg harvest";

      var hint = $("#qtyHint");
      if (hint) hint.textContent = state.packs + " " + PACK_LABEL[state.pack] + " = " + num(eggs) + " eggs (" + trays + " tray equivalent)";

      return { eggs: eggs, trays: trays, rate: rate, goods: goods, delivery: delivery, total: total, slab: slab, pct: pct };
    }

    $$("#packGroup .seg-opt").forEach(function (b) {
      b.addEventListener("click", function () {
        $$("#packGroup .seg-opt").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        state.pack = b.getAttribute("data-pack");
        state.packs = state.pack === "bulk" ? 1 : state.packs;
        var q = $("#calcQty");
        if (state.pack === "bulk") { q.min = 1; q.max = 60; if (state.packs > 60) state.packs = 60; }
        else { q.min = 1; q.max = 500; if (state.packs > 500) state.packs = 500; }
        q.value = state.packs;
        render();
      });
    });

    $$("#freqGroup .seg-opt").forEach(function (b) {
      b.addEventListener("click", function () {
        $$("#freqGroup .seg-opt").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        state.freq = parseInt(b.getAttribute("data-freq"), 10) || 1;
        render();
      });
    });

    $$("[data-step]").forEach(function (b) {
      b.addEventListener("click", function () {
        var q = $("#calcQty");
        var v = (parseInt(q.value, 10) || 1) + parseInt(b.getAttribute("data-step"), 10);
        var min = parseInt(q.min, 10) || 1, max = parseInt(q.max, 10) || 999;
        v = Math.max(min, Math.min(max, v));
        q.value = v; state.packs = v; render();
      });
    });

    $("#calcQty").addEventListener("input", function () {
      var v = parseInt(this.value, 10);
      if (isNaN(v) || v < 1) v = 1;
      state.packs = v; render();
    });

    $("#calcCity").addEventListener("change", function () {
      state.fee = parseInt(this.value, 10) || 0;
      render();
    });

    var send = $("#sendWa");
    if (send) send.addEventListener("click", function () {
      var r = render();
      var name = ($("#calcName").value || "").trim();
      var citySel = $("#calcCity");
      var city = citySel.options[citySel.selectedIndex].text;
      var freqBtn = $("#freqGroup .seg-opt[aria-pressed='true']");
      var freqLabel = freqBtn ? freqBtn.textContent.replace(/\s+/g, " ").trim() : "One-time";
      var msg = "Hello Sri Rajarajeswara Poultry Farm,\n\n" +
        "Bulk egg enquiry:" + (name ? "\nName: " + name : "") + "\n" +
        "Packing: " + state.packs + " " + PACK_LABEL[state.pack] + " (" + r.eggs + " eggs)\n" +
        "Slab rate: " + inr(r.rate) + "/egg (" + r.slab.label + ")\n" +
        "Goods value: " + inr(r.goods) + "\n" +
        "Delivery to: " + city + " (" + (r.delivery ? inr(r.delivery) : "Free") + ")\n" +
        "Estimated total: " + inr(r.total) + "\n" +
        "Frequency: " + freqLabel + "\n\nPlease confirm availability and dispatch time. Thank you.";
      window.open(waLink(msg), "_blank", "noopener");
      toast("Opening WhatsApp with your order details…");
    });

    render();
  }

  /* =========================================================
     7. Gallery lightbox
     ========================================================= */
  function initGallery() {
    var box = $("#lightbox");
    var grid = $("#gallery-grid");
    if (!box || !grid) return;

    var items = $$(".gal-item", grid);
    var idx = 0;

    function show(i) {
      idx = (i + items.length) % items.length;
      var el = items[idx];
      $("#lbImg").src = el.getAttribute("data-full");
      $("#lbImg").alt = el.getAttribute("data-cap");
      $("#lbCap").innerHTML = "";
      $("#lbCap").appendChild(document.createTextNode(el.getAttribute("data-cap")));
      var s = document.createElement("span");
      s.textContent = el.getAttribute("data-sub") || "";
      $("#lbCap").appendChild(s);
    }
    function open(i) { show(i); box.classList.add("show"); document.body.style.overflow = "hidden"; }
    function close() { box.classList.remove("show"); document.body.style.overflow = ""; }

    items.forEach(function (el, i) {
      el.addEventListener("click", function () { open(i); });
      el.setAttribute("tabindex", "0");
      el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); } });
    });

    $("#lbClose").addEventListener("click", close);
    $("#lbPrev").addEventListener("click", function () { show(idx - 1); });
    $("#lbNext").addEventListener("click", function () { show(idx + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });

    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("show")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* =========================================================
     8. Farm film (chapter tour + optional YouTube)
     ========================================================= */
  function initFilm() {
    var track = $("#filmTrack");
    if (!track) return;
    var tabs = $$(".film-tab", track);
    var img = $("#filmImg"), cap = $("#filmCap"), sub = $("#filmSub");
    var timer = null, active = 0;

    function select(i, fromAuto) {
      active = (i + tabs.length) % tabs.length;
      tabs.forEach(function (t, k) { t.classList.toggle("active", k === active); });
      var t = tabs[active];
      img.style.opacity = "0";
      setTimeout(function () {
        img.src = t.getAttribute("data-img");
        cap.innerHTML = t.getAttribute("data-cap");
        sub.textContent = t.getAttribute("data-sub");
        img.style.opacity = "1";
      }, 180);
      if (!fromAuto && timer) stopTour();
    }
    tabs.forEach(function (t, i) { t.addEventListener("click", function () { select(i); }); });

    function stopTour() { if (timer) { clearInterval(timer); timer = null; } }
    function startTour() {
      stopTour();
      timer = setInterval(function () { select(active + 1, true); }, 3400);
    }

    var modal = $("#videoModal"), holder = $("#videoHolder");
    function openVideo() {
      var yt = (CFG.youtube || "").trim();
      if (yt) {
        holder.innerHTML = '<iframe src="https://www.youtube.com/embed/' + encodeURIComponent(yt) +
          '?autoplay=1&rel=0&modestbranding=1" title="Sri Rajarajeswara Poultry Farm video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>';
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
      } else {
        select(0);
        startTour();
        toast(CFG.videoFallbackNote);
      }
    }
    function closeVideo() {
      modal.classList.remove("show");
      holder.innerHTML = "";
      stopTour();
      document.body.style.overflow = "";
    }

    var play = $("#playBtn");
    if (play) play.addEventListener("click", openVideo);
    $("#videoClose").addEventListener("click", closeVideo);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeVideo(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeVideo(); });
    $$("[data-yt]").forEach(function (a) {
      a.setAttribute("href", "#");
      a.addEventListener("click", function (e) { e.preventDefault(); openVideo(); });
    });

    img.style.transition = "opacity .35s ease";
  }

  /* =========================================================
     9. Testimonials slider
     ========================================================= */
  function initSlider() {
    var track = $("#sliderTrack"), dots = $("#sliderDots");
    if (!track) return;
    var slides = $$(".slide", track);
    var i = 0, timer = null;

    slides.forEach(function (s, k) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", "Review " + (k + 1));
      b.addEventListener("click", function () { go(k); restart(); });
      dots.appendChild(b);
    });
    var dotEls = $$("button", dots);

    function go(n) {
      i = (n + slides.length) % slides.length;
      track.style.transform = "translateX(-" + i * 100 + "%)";
      dotEls.forEach(function (d, k) {
        d.classList.toggle("active", k === i);
        d.setAttribute("aria-selected", k === i ? "true" : "false");
      });
    }
    function restart() { stop(); timer = setInterval(function () { go(i + 1); }, 6500); }
    function stop() { if (timer) clearInterval(timer); }

    $("#nextSlide").addEventListener("click", function () { go(i + 1); restart(); });
    $("#prevSlide").addEventListener("click", function () { go(i - 1); restart(); });

    var box = $("#slider");
    box.addEventListener("mouseenter", stop);
    box.addEventListener("mouseleave", function () { if (window.innerWidth > 720) restart(); });

    /* touch swipe */
    var x0 = null;
    box.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; stop(); }, { passive: true });
    box.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) go(i + (dx < 0 ? 1 : -1));
      x0 = null;
      if (window.innerWidth > 720) restart();
    });

    go(0);
    if (window.innerWidth > 720) restart();
  }

  /* =========================================================
     10. FAQ accordion
     ========================================================= */
  function initFaq() {
    var list = $("#faqList");
    if (!list) return;
    $$(".faq-item", list).forEach(function (item) {
      var q = $(".faq-q", item), a = $(".faq-a", item);
      q.addEventListener("click", function () {
        var open = item.classList.contains("open");
        $$(".faq-item", list).forEach(function (o) {
          o.classList.remove("open");
          $(".faq-q", o).setAttribute("aria-expanded", "false");
          $(".faq-a", o).style.maxHeight = "0px";
        });
        if (!open) {
          item.classList.add("open");
          q.setAttribute("aria-expanded", "true");
          a.style.maxHeight = a.scrollHeight + "px";
        }
      });
    });
    window.addEventListener("resize", function () {
      var open = $(".faq-item.open", list);
      if (open) $(".faq-a", open).style.maxHeight = $(".faq-a", open).scrollHeight + "px";
    });
  }

  /* =========================================================
     11. Enquiry form + leads
     ========================================================= */
  function loadLeads() {
    try { return JSON.parse(localStorage.getItem(LEADS_KEY)) || []; } catch (e) { return []; }
  }
  function saveLeads(list) {
    try { localStorage.setItem(LEADS_KEY, JSON.stringify(list)); } catch (e) {}
  }

  function buildMessage(d) {
    return "Hello Sri Rajarajeswara Poultry Farm,\n\n" +
      "Name: " + d.name + "\n" +
      "Mobile: " + d.phone + "\n" +
      "City: " + d.city + "\n" +
      "Business type: " + d.type + "\n" +
      "Requirement: " + d.product + "\n" +
      "Quantity per day: " + d.qty + "\n" +
      (d.msg ? "Message: " + d.msg + "\n" : "") +
      "\nPlease share today's rate card and availability. Thank you.";
  }

  function readForm() {
    return {
      name: $("#eName").value.trim(),
      phone: $("#ePhone").value.trim().replace(/[^\d]/g, ""),
      city: $("#eCity").value.trim(),
      type: $("#eType").value,
      product: $("#eProduct").value,
      qty: $("#eQty").value,
      msg: $("#eMsg").value.trim()
    };
  }

  function validate(d) {
    if (d.name.length < 2) { $("#eName").focus(); toast("Please enter your name"); return false; }
    if (!/^[6-9]\d{9}$/.test(d.phone)) { $("#ePhone").focus(); toast("Enter a valid 10-digit mobile number"); return false; }
    if (d.city.length < 2) { $("#eCity").focus(); toast("Please enter your city or town"); return false; }
    return true;
  }

  function initForm() {
    var form = $("#enquiryForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = readForm();
      if (!validate(d)) return;
      window.open(waLink(buildMessage(d)), "_blank", "noopener");
      toast("Opening WhatsApp with your enquiry…");
    });

    var save = $("#saveLead");
    if (save) save.addEventListener("click", function () {
      var d = readForm();
      if (!validate(d)) return;
      var list = loadLeads();
      d.date = new Date().toLocaleDateString("en-IN");
      list.unshift(d);
      saveLeads(list.slice(0, 100));
      renderLeads();
      toast("Saved to your enquiry list");
    });

    $("#ePhone").addEventListener("input", function () { this.value = this.value.replace(/\D/g, "").slice(0, 10); });
  }

  function renderLeads() {
    var box = $("#leadsList");
    if (!box) return;
    var list = loadLeads();
    if (!list.length) { box.innerHTML = '<p class="hint">No enquiries saved yet.</p>'; return; }
    box.innerHTML = "";
    list.forEach(function (l, i) {
      var row = document.createElement("div");
      row.className = "admin-row";
      var left = document.createElement("div");
      left.innerHTML = "<b></b><small></small>";
      left.children[0].textContent = l.name + " — " + l.city;
      left.children[1].textContent = l.date + " · " + l.product + " · " + l.phone;
      var del = document.createElement("button");
      del.className = "icon-btn";
      del.type = "button";
      del.setAttribute("aria-label", "Delete enquiry from " + l.name);
      del.innerHTML = '<svg class="i"><use href="#i-x"></use></svg>';
      del.addEventListener("click", function () {
        var arr = loadLeads();
        arr.splice(i, 1);
        saveLeads(arr);
        renderLeads();
      });
      row.appendChild(left);
      row.appendChild(del);
      box.appendChild(row);
    });
  }

  /* =========================================================
     12. Admin panel
     ========================================================= */
  function setCfg(path, value) {
    var keys = path.split(".");
    var cur = overrides;
    for (var i = 0; i < keys.length - 1; i++) {
      if (typeof cur[keys[i]] !== "object" || cur[keys[i]] === null) cur[keys[i]] = {};
      cur = cur[keys[i]];
    }
    cur[keys[keys.length - 1]] = value;
    window.SRR_saveOverrides(overrides);
  }
  function getCfg(path) {
    var keys = path.split("."), cur = CFG;
    for (var i = 0; i < keys.length; i++) { if (cur == null) return ""; cur = cur[keys[i]]; }
    return cur;
  }

  function fillAdmin() {
    $$("[data-cfg]").forEach(function (el) { el.value = getCfg(el.getAttribute("data-cfg")); });
    $$("[data-toggle]").forEach(function (sw) {
      var key = sw.getAttribute("data-toggle");
      sw.setAttribute("aria-pressed", ui[key] === false ? "false" : "true");
    });
    renderLeads();
  }

  function applyToggles() {
    var bar = $(".est-bar"), cap = $("#estCapacity");
    var capHidden = ui.capacityBar === false;
    if (bar) bar.style.display = capHidden ? "none" : "";
    if (cap) cap.style.display = capHidden ? "none" : "";
    var fabs = $(".fab-stack");
    if (fabs) fabs.style.display = ui.fabs === false ? "none" : "";
    if (ui.reveal === false) $$(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  function initAdmin() {
    var panel = $("#adminPanel"), ov = $("#adminOverlay");
    function open() {
      panel.classList.add("open"); ov.classList.add("show");
      document.body.style.overflow = "hidden";
      fillAdmin();
    }
    function close() {
      panel.classList.remove("open"); ov.classList.remove("show");
      document.body.style.overflow = "";
    }
    $$("[data-admin-open]").forEach(function (a) {
      a.setAttribute("href", "#");
      a.addEventListener("click", function (e) { e.preventDefault(); open(); });
    });
    $("#adminClose").addEventListener("click", close);
    ov.addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

    $("#adminUnlock").addEventListener("click", tryUnlock);
    $("#adminPin").addEventListener("keydown", function (e) { if (e.key === "Enter") tryUnlock(); });

    function tryUnlock() {
      var pin = ($("#adminPin").value || "").trim();
      if (pin === String(getCfg("adminPin"))) {
        $("#adminLogin").hidden = true;
        $("#adminBody").hidden = false;
        $("#adminErr").textContent = "";
        fillAdmin();
        toast("Welcome, " + CFG.founder);
      } else {
        $("#adminErr").textContent = "Incorrect PIN. Hint: the last 4 digits of your phone number.";
      }
    }

    $$(".admin-tabs button").forEach(function (b) {
      b.addEventListener("click", function () {
        $$(".admin-tabs button").forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        $$(".admin-section").forEach(function (s) { s.classList.remove("active"); });
        var sec = document.getElementById("tab-" + b.getAttribute("data-tab"));
        if (sec) sec.classList.add("active");
      });
    });

    $("#saveBusiness").addEventListener("click", function () {
      $$("[data-cfg]").forEach(function (el) {
        if (!el.closest("#tab-business")) return;
        var v = el.value.trim();
        if (v) setCfg(el.getAttribute("data-cfg"), v);
      });
      Object.assign(CFG, deepMerge(DEFAULTS, overrides));
      bindAll(); initCalc(); fillAdmin();
      toast("Business details updated");
    });

    $("#savePricing").addEventListener("click", function () {
      $$("[data-cfg]").forEach(function (el) {
        if (!el.closest("#tab-pricing")) return;
        var v = parseFloat(el.value);
        if (!isNaN(v)) setCfg(el.getAttribute("data-cfg"), v);
      });
      Object.assign(CFG, deepMerge(DEFAULTS, overrides));
      bindAll(); initCalc(); fillAdmin();
      toast("Rates updated across the page");
    });

    $$("[data-toggle]").forEach(function (sw) {
      sw.addEventListener("click", function () {
        var key = sw.getAttribute("data-toggle");
        var on = sw.getAttribute("aria-pressed") !== "true";
        sw.setAttribute("aria-pressed", on ? "true" : "false");
        ui[key] = on;
        saveUI(ui);
        applyToggles();
      });
    });

    $("#exportLeads").addEventListener("click", function () {
      var list = loadLeads();
      if (!list.length) { toast("No saved enquiries yet"); return; }
      var csv = "Name,Mobile,City,Business,Requirement,Qty,Message,Date\n" + list.map(function (l) {
        return [l.name, l.phone, l.city, l.type, l.product, l.qty, (l.msg || "").replace(/[\r\n]+/g, " "), l.date]
          .map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(",");
      }).join("\n");
      copyText(csv, "Enquiries copied — paste into Excel");
    });

    $("#clearLeads").addEventListener("click", function () {
      saveLeads([]);
      renderLeads();
      toast("All saved enquiries cleared");
    });

    $("#copyWa").addEventListener("click", function () {
      copyText(waLink(WA_MSGS.general), "WhatsApp link copied");
    });

    $("#printPage").addEventListener("click", function () {
      toast("Opening print dialog — choose 'Save as PDF' for a rate card");
      setTimeout(function () { window.print(); }, 600);
    });

    $("#resetAll").addEventListener("click", function () {
      if (!window.confirm("Reset all prices, contact details and preferences to factory defaults?")) return;
      window.SRR_clearOverrides();
      try { localStorage.removeItem(UI_KEY); } catch (e) {}
      window.location.reload();
    });
  }

  /* =========================================================
     Boot
     ========================================================= */
  function boot() {
    var y = $("#year");
    if (y) y.textContent = String(new Date().getFullYear());

    bindAll();
    initTheme();
    initChrome();
    initReveal();
    applyToggles();
    initCounters();
    initCalc();
    initGallery();
    initFilm();
    initSlider();
    initFaq();
    initForm();
    initAdmin();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
