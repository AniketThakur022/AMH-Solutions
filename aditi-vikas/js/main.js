/* =====================================================================
   Aditi & Vikas — Wedding Invitation
   All content comes from js/config.js (window.WEDDING).
   No libraries — plain JS so it stays light on phones.
   ===================================================================== */
(function () {
  'use strict';

  var W = window.WEDDING || {};
  var doc = document;
  var root = doc.documentElement;
  root.classList.add('js');

  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  var couple = W.couple || {};
  var A = couple.first || {};
  var B = couple.second || {};
  var NAMES = [A.name, B.name].filter(Boolean).join(' & ');
  var ALT = NAMES ? NAMES + ' — pre-wedding photo' : 'Pre-wedding photo';

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  /* ---------- small helpers ---------- */
  var PHOTO_DIR = 'assets/photos/';
  function photo(id, opts) {
    opts = opts || {};
    return '<img src="' + PHOTO_DIR + id + '-800.webp"' +
      ' srcset="' + PHOTO_DIR + id + '-800.webp 800w, ' + PHOTO_DIR + id + '-1400.webp 1400w"' +
      ' sizes="' + (opts.sizes || '100vw') + '"' +
      ' alt="' + esc(opts.alt == null ? ALT : opts.alt) + '"' +
      (opts.eager ? ' fetchpriority="high"' : ' loading="lazy"') +
      ' decoding="async" draggable="false" />';
  }
  var ARCH_PATH = 'M0,150 V46 C0,39 3,34 9,32 C6,24 11,16 20,16 C22,8 31,3 39,7 C42,3 46,0 50,0 C54,0 58,3 61,7 C69,3 78,8 80,16 C89,16 94,24 91,32 C97,34 100,39 100,46 V150 Z';
  function archLines() {
    var svg = function (cls) {
      return '<svg class="arch__line ' + cls + '" viewBox="0 0 100 150" preserveAspectRatio="none" aria-hidden="true">' +
        '<path d="' + ARCH_PATH + '" vector-effect="non-scaling-stroke" /></svg>';
    };
    return svg('') + svg('arch__line--2');
  }
  function arch(id, sizes) {
    return '<div class="arch__img">' + photo(id, { sizes: sizes }) + '</div>' + archLines();
  }
  function toast(msg) {
    var t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove('is-on'); }, 2400);
  }
  function parseDate(v) {
    if (!v) return null;
    v = String(v);
    // a date without a time means "that day in India", not UTC midnight
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) v += 'T00:00:00+05:30';
    var d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  var IST = 'Asia/Kolkata';
  function fmtDate(d, o) {
    try { return d.toLocaleDateString('en-IN', Object.assign({ timeZone: IST }, o)); }
    catch (e) { return d.toDateString(); }
  }
  function fmtTime(d) {
    try { return d.toLocaleTimeString('en-IN', { timeZone: IST, hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase(); }
    catch (e) { return ''; }
  }

  /* =====================================================================
     TEXT BINDINGS
     ===================================================================== */
  var AMP = '<i class="amp-i">&amp;</i>';
  var bindings = {
    names: [A.name, B.name].filter(Boolean).map(esc).join(' ' + AMP + ' '),
    monogram: [A.name, B.name].filter(Boolean).map(function (n) { return esc(n.charAt(0)); }).join(AMP),
    invocation: esc(W.invocation || ''),
    shubh: esc(W.shubh || '')
  };
  $$('[data-bind]').forEach(function (el) {
    var v = bindings[el.getAttribute('data-bind')];
    if (v) el.innerHTML = v; else el.hidden = true;
  });
  if (NAMES) doc.title = NAMES + ' — Wedding Invitation';

  /* ---------- personal greeting on the cover:  …/aditi-vikas/?to=Sharma%20Family ----------
     The name is shown as plain text only, tidied and capped at 60 characters. */
  var guestName = '';
  try { guestName = new URLSearchParams(location.search).get('to') || ''; } catch (e) { guestName = ''; }
  guestName = guestName.replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
  if (guestName) {
    $('#gateGuestLabel').textContent = W.guestLabel || 'A special invitation for';
    $('#gateGuestName').textContent = guestName;
    $('#gateGuest').hidden = false;
  }

  $$('.divider path').forEach(function (p) { p.setAttribute('pathLength', '1'); });

  /* =====================================================================
     HERO
     ===================================================================== */
  var weddingDate = parseDate(W.date);

  $('#heroNames').innerHTML =
    '<span class="n n--1">' + esc(A.name) + '</span>' +
    '<span class="amp">&amp;</span>' +
    '<span class="n n--2">' + esc(B.name) + '</span>';
  var hasTime = /T\d{2}:\d{2}/.test(String(W.date || ''));
  // the wording from config ("8 PM onwards") if given, otherwise the clock time when the date has one
  var whenText = weddingDate ? (W.timeText || (hasTime ? fmtTime(weddingDate) : '')) : '';
  $('#heroDate').textContent = weddingDate
    ? fmtDate(weddingDate, { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Date to be announced';
  $('#heroCity').textContent = (weddingDate
    ? [fmtDate(weddingDate, { weekday: 'long' }), whenText, W.city]
    : [W.city]).filter(Boolean).join(' · ');

  var heroMedia = $('#heroMedia');
  var heroIds = (W.heroPhotos || []).slice();
  heroMedia.innerHTML = heroIds.map(function (id, i) {
    // first slide loads immediately, the rest are attached after the doors open
    var inner = i === 0 ? photo(id, { sizes: '(min-width: 900px) 520px, 100vw', eager: true }) : '';
    return '<div class="hero__slide' + (i === 0 ? ' is-active is-zoom' : '') + '" data-id="' + id + '">' + inner + '</div>';
  }).join('');
  heroMedia.insertAdjacentHTML('afterend', archLines());
  var slides = $$('.hero__slide', heroMedia);
  var slideIdx = 0;
  function nextSlide() {
    if (slides.length < 2 || doc.hidden) return;
    var cur = slides[slideIdx];
    slideIdx = (slideIdx + 1) % slides.length;
    var nxt = slides[slideIdx];
    nxt.classList.remove('is-zoom');
    void nxt.offsetWidth;                      // restart the slow zoom
    nxt.classList.add('is-active', 'is-zoom');
    cur.classList.remove('is-active');
  }
  function startHero() {
    slides.forEach(function (s, i) {
      if (i > 0 && !s.firstChild) {
        s.innerHTML = photo(s.getAttribute('data-id'), { sizes: '(min-width: 900px) 520px, 100vw' });
        s.firstChild.loading = 'eager';
      }
    });
    if (!reduceMotion) setInterval(nextSlide, 6500);
  }

  /* ---------- toran (marigold garland) ---------- */
  var toran = $('#toran');
  var toranW = 0;
  function buildToran() {
    var w = toran.clientWidth || window.innerWidth;
    if (Math.abs(w - toranW) < 40) return;
    toranW = w;
    var gap = w < 700 ? 21 : 27;
    var n = Math.max(9, Math.round(w / gap));
    var mid = (n - 1) / 2;
    var maxLen = w < 700 ? 9 : 12;
    var html = '';
    for (var i = 0; i < n; i++) {
      var t = Math.abs(i - mid) / mid;                       // 0 centre → 1 edge
      var len = Math.max(1, Math.round(1 + (maxLen - 1) * Math.pow(t, 2.1)));
      var beads = '';
      for (var j = 0; j < len; j++) {
        if (j > 0 && j % 3 === 0) beads += '<span class="mg mg--w"></span>';
        beads += '<span class="mg' + ((i + j) % 2 ? ' mg--y' : '') + '"></span>';
      }
      html += '<div class="strand" style="--dur:' + rand(3.6, 6).toFixed(2) + 's;--delay:-' + rand(0, 5).toFixed(2) + 's">' +
        beads + '<span class="leaf"></span></div>';
    }
    toran.innerHTML = html;
  }
  buildToran();

  /* =====================================================================
     INVITATION
     ===================================================================== */
  if (W.invitePhoto) $('#inviteArch').innerHTML = arch(W.invitePhoto, '(min-width: 700px) 330px, 74vw');
  else $('#inviteArch').hidden = true;

  function person(p, side) {
    return '<div class="person" data-reveal="' + side + '">' +
      '<div class="arch">' + arch(p.photo, '(min-width: 700px) 260px, 42vw') + '</div>' +
      '<p class="person__name">' + esc(p.name) + '</p>' +
      '<p class="person__role">' + esc(p.role || '') + '</p>' +
      '<p class="person__parents">' + esc(p.parents || '') + '</p>' +
      '</div>';
  }
  $('#couple').innerHTML = person(A, 'left') + '<span class="couple__amp" data-reveal="zoom" style="--d:.3s">&amp;</span>' + person(B, 'right');

  /* =====================================================================
     SAVE THE DATE + COUNTDOWN
     ===================================================================== */
  var cdEls = {};
  $$('[data-cd]').forEach(function (el) { cdEls[el.getAttribute('data-cd')] = el; });
  function setCd(key, val) {
    var el = cdEls[key];
    var txt = (val < 10 ? '0' : '') + val;
    if (el.textContent === txt) return;
    el.textContent = txt;
    if (!reduceMotion) {
      el.classList.remove('tick');
      void el.offsetWidth;
      el.classList.add('tick');
    }
  }
  function tickCountdown() {
    var diff = weddingDate.getTime() - Date.now();
    if (diff <= 0) {
      ['days', 'hours', 'minutes', 'seconds'].forEach(function (k) { setCd(k, 0); });
      var DAY = 86400000;
      $('#cdNote').textContent = -diff < (hasTime ? DAY / 4 : DAY)
        ? (hasTime ? 'The celebrations have begun!' : 'Today is the day!')
        : 'Happily married!';
      return false;
    }
    var s = Math.floor(diff / 1000);
    setCd('days', Math.floor(s / 86400));
    setCd('hours', Math.floor((s % 86400) / 3600));
    setCd('minutes', Math.floor((s % 3600) / 60));
    setCd('seconds', s % 60);
    return true;
  }
  if (weddingDate) {
    // stacked: weekday / date / time, so it never breaks mid-date on a narrow phone
    $('#bigDate').innerHTML =
      '<span class="bigdate__day">' + esc(fmtDate(weddingDate, { weekday: 'long' })) + '</span>' +
      '<span class="bigdate__main">' + esc(fmtDate(weddingDate, { day: 'numeric', month: 'long', year: 'numeric' })) + '</span>' +
      (whenText ? '<span class="bigdate__when">' + esc(whenText) + '</span>' : '');
    if (tickCountdown()) {
      var cdTimer = setInterval(function () { if (!tickCountdown()) clearInterval(cdTimer); }, 1000);
    }
    var calBtn = $('#calBtn');
    calBtn.hidden = false;
    calBtn.addEventListener('click', downloadIcs);
  } else {
    $('#bigDate').textContent = 'Date to be announced';
    $('#cdNote').textContent = 'The countdown begins the moment the date is announced.';
  }

  function downloadIcs() {
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var stamp = function (d) {
      return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' +
        pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
    };
    var icsEsc = function (s) { return String(s || '').replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n'); };
    var end = new Date(weddingDate.getTime() + 4 * 3600 * 1000);
    var dtStart = 'DTSTART:' + stamp(weddingDate);
    var dtEnd = 'DTEND:' + stamp(end);
    if (!hasTime) {
      // no exact time yet → an all-day entry on the wedding date
      var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(W.date));
      var next = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3] + 1));
      dtStart = 'DTSTART;VALUE=DATE:' + m[1] + m[2] + m[3];
      dtEnd = 'DTEND;VALUE=DATE:' + next.getUTCFullYear() + pad(next.getUTCMonth() + 1) + pad(next.getUTCDate());
    }
    var v = W.venue || {};
    var loc = [v.name, v.address].filter(Boolean).join(', ');
    var lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Wedding Invitation//EN', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:wedding-' + weddingDate.getTime() + '@invitation',
      'DTSTAMP:' + stamp(new Date()),
      dtStart,
      dtEnd,
      'SUMMARY:' + icsEsc(NAMES + ' — Wedding'),
      loc ? 'LOCATION:' + icsEsc(loc) : '',
      'URL:' + location.href.split('#')[0],
      'END:VEVENT', 'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');
    var url = URL.createObjectURL(new Blob([lines], { type: 'text/calendar;charset=utf-8' }));
    var a = doc.createElement('a');
    a.href = url;
    a.download = 'wedding.ics';
    doc.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  /* =====================================================================
     EVENTS
     ===================================================================== */
  var ICONS = {
    haldi: '<path d="M7 25h34c0 9-7.5 15-17 15S7 34 7 25z"/><path d="M17 44h14M24 40v4"/><path d="M13 25c1-5 5.5-8 11-8s10 3 11 8"/><path d="M25 13c0-4 2.5-7 6-8 .5 4-1.5 7-6 8zM23 12c-1-3-3.5-5-7-5 0 3.5 3 5.5 7 5z"/>',
    mehndi: '<path d="M27 6c9 3 14 12 11 21-3 9-12 14-20 11-7-3-10-11-6-17 3-5 10-6 13-2 3 4 0 9-4 9-3 0-4-3-3-5"/><path d="M34 4l1 3M40 8l-2 2.5M43 14l-3 1"/><path d="M11 41c2.5 2 5.5 3 9 3"/>',
    sangeet: '<ellipse cx="11" cy="25" rx="5" ry="12"/><ellipse cx="37" cy="25" rx="5" ry="12"/><path d="M11 13h26M11 37h26"/><path d="M16.5 14l5 22 5-22 5 22"/><path d="M19 8l10-3"/>',
    wedding: '<path d="M16 21c-5 3-8 8-6 14 2 5 7 8 14 8s12-3 14-8c2-6-1-11-6-14"/><path d="M15 18h18v3H15z"/><path d="M24 4c3 2.5 4.5 5 4.5 8 0 3-2 5-4.5 5s-4.5-2-4.5-5c0-3 1.5-5.5 4.5-8z"/><path d="M19 16c-4-1-7-4-8-8 4 0 7 3 8 8zM29 16c4-1 7-4 8-8-4 0-7 3-8 8z"/><path d="M10.5 30c4 2 8.5 3 13.5 3s9.5-1 13.5-3"/>',
    carnival: '<circle cx="24" cy="20" r="13"/><circle cx="24" cy="20" r="2.5"/><path d="M24 7v10.5M24 22.5V33M11 20h10.5M26.5 20H37M14.8 10.8l7.4 7.4M25.8 21.8l7.4 7.4M33.2 10.8l-7.4 7.4M22.2 21.8l-7.4 7.4"/><path d="M22.5 22l-7 22M25.5 22l7 22M11 44h26"/>',
    reception: '<circle cx="18" cy="31" r="10"/><circle cx="30" cy="31" r="10"/><path d="M18 21l-3.5-4.5L18 12l3.5 4.5z"/><path d="M34 5v6M31 8h6M41 13v4M39 15h4"/>',
    lotus: '<path d="M24 10c4.5 5 6.5 10 6.5 15S28 35 24 37c-4-2-6.5-7-6.5-12S19.5 15 24 10z"/><path d="M17.5 27c-5-1.5-9-5.5-10-11 5 0 9 2 11.5 6M30.5 27c5-1.5 9-5.5 10-11-5 0-9 2-11.5 6"/><path d="M6 33c5 5 11 8 18 8s13-3 18-8"/>'
  };
  var I_CAL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/></svg>';
  var I_PIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';

  function eventWhen(e) {
    var d = e.date || '';
    if (/^\d{4}-\d{2}-\d{2}/.test(d)) {
      var parsed = parseDate(d.length === 10 ? d + 'T12:00:00+05:30' : d);
      if (parsed) d = fmtDate(parsed, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
    // the time stays on one line ("8 PM onwards" never splits); the date may wrap on narrow phones
    return [d ? esc(d) : '', e.time ? '<span class="nw">' + esc(e.time) + '</span>' : ''].filter(Boolean).join(' · ');
  }
  var events = W.events || [];
  var timeline = $('#timeline');
  if (events.length) {
    timeline.innerHTML = '<span class="timeline__fill" id="timelineFill" aria-hidden="true"></span>' +
      events.map(function (e) {
        var when = eventWhen(e);
        return '<li class="event" data-reveal>' +
          '<div class="event__icon"><svg viewBox="0 0 48 48" aria-hidden="true">' + (ICONS[e.icon] || ICONS.lotus) + '</svg></div>' +
          '<div class="event__card">' +
          '<h3 class="event__name">' + esc(e.name) + '</h3>' +
          (e.note ? '<p class="event__note">' + esc(e.note) + '</p>' : '') +
          '<div class="event__meta">' +
          '<p class="event__row' + (when ? '' : ' is-tba') + '">' + I_CAL + '<span>' + (when || 'Date &amp; time to be announced') + '</span></p>' +
          '<p class="event__row' + (e.venue ? '' : ' is-tba') + '">' + I_PIN + '<span>' + esc(e.venue || 'Venue to be announced') + '</span></p>' +
          (e.mapUrl ? '<p><a class="event__map" href="' + esc(e.mapUrl) + '" target="_blank" rel="noopener">View on map →</a></p>' : '') +
          '</div></div></li>';
      }).join('');
  } else {
    $('#events').hidden = true;
  }

  /* ---------- venue ---------- */
  var venue = W.venue || {};
  if (venue.name) {
    $('#venue').hidden = false;
    $('#events').classList.add('has-venue');
    $('#quote').classList.add('after-venue');
    $('#venueName').textContent = venue.name;
    $('#venueAddr').textContent = venue.address || '';
    if (venue.mapUrl) {
      $('#venueMap').href = venue.mapUrl;
      $('#venueMap').hidden = false;
    }
  }

  /* ---------- wide photo backgrounds ---------- */
  function backdrop(cfg) {
    if (!cfg) return '';
    if (typeof cfg === 'string') cfg = { tall: cfg };
    var tall = cfg.tall || cfg.wide;
    var wide = cfg.wide || cfg.tall;
    return '<picture>' +
      '<source media="(min-width: 900px)" srcset="' + PHOTO_DIR + wide + '-1400.webp" />' +
      photo(tall, { alt: '' }) + '</picture>';
  }
  $('#quoteBg').innerHTML = backdrop(W.quotePhoto);
  $('#closingBg').innerHTML = backdrop(W.closingPhoto);

  /* =====================================================================
     GALLERY
     ===================================================================== */
  var WIDE = W.widePhotos || [];
  var LB = [];                                   // every gallery photo, in order, for the viewer
  function ph(id, cls, sizes, extra) {
    var idx = LB.indexOf(id);
    if (idx < 0) { LB.push(id); idx = LB.length - 1; }
    return '<button type="button" class="ph ' + cls + '" data-lb="' + idx + '" aria-label="Open photo"' + (extra || '') + '>' +
      photo(id, { sizes: sizes }) + '</button>';
  }
  var gallery = $('#gallery');
  gallery.innerHTML = (W.gallery || []).map(function (ch, ci) {
    var ids = ch.photos || [];
    var body = '';
    if (ch.layout === 'ribbon') {
      var half = Math.ceil(ids.length / 2);
      var vw = window.innerWidth;
      var itemW = Math.min(vw * 0.4, 230) + 10;
      [ids.slice(0, half), ids.slice(half)].forEach(function (row, r) {
        if (!row.length) return;
        // one "set" must be wider than the screen so the loop never shows a gap
        var reps = Math.max(1, Math.ceil((Math.max(vw, 1280) + 120) / (row.length * itemW)));
        var first = row.map(function (id) { return ph(id, 'ribbon__item', '(min-width: 700px) 230px, 40vw'); }).join('');
        var clone = first.replace(/<button /g, '<button tabindex="-1" aria-hidden="true" ');
        var set = first, k;
        for (k = 1; k < reps; k++) set += clone;
        var set2 = '';
        for (k = 0; k < reps; k++) set2 += clone;
        var secs = Math.round(row.length * reps * itemW / 20);          // ≈ 20px per second
        body += '<div class="ribbon' + (r ? ' ribbon--rev' : '') + '"><div class="ribbon__track" style="animation-duration:' + secs + 's">' +
          set + set2 + '</div></div>';
      });
    } else if (ch.layout === 'grid') {
      var col = 0;
      body = '<div class="pgrid">' + ids.map(function (id) {
        if (WIDE.indexOf(id) >= 0) {
          col = 0;
          return ph(id, 'pgrid__item pgrid__item--wide', '(min-width: 700px) 50vw, 100vw', ' data-reveal');
        }
        var down = col % 2 === 1;
        col++;
        return ph(id, 'pgrid__item' + (down ? ' is-down' : ''), '(min-width: 700px) 25vw, 50vw',
          ' data-reveal style="--d:' + (down ? '.12' : '0') + 's"');
      }).join('') + '</div>';
    } else {
      body = '<div class="cflow">' + ids.map(function (id) { return ph(id, 'cflow__item', '(min-width: 700px) 330px, 70vw'); }).join('') + '</div>' +
        '<div class="dots" aria-hidden="true">' + ids.map(function () { return '<i></i>'; }).join('') + '</div>' +
        '<p class="swipe-hint" aria-hidden="true"><span>← Swipe →</span></p>';
    }
    return '<div class="chapter">' +
      '<div class="chapter__head" data-reveal><span class="chapter__no">' + (ci < 9 ? '0' : '') + (ci + 1) + '</span>' +
      '<h3 class="chapter__title">' + esc(ch.title || '') + '</h3></div>' +
      (ch.note ? '<p class="chapter__note" data-reveal>' + esc(ch.note) + '</p>' : '') +
      body + '</div>';
  }).join('');

  /* coverflow: scale / tilt cards by their distance from centre */
  $$('.cflow').forEach(function (cf) {
    var items = $$('.cflow__item', cf);
    var dots = $$('i', cf.nextElementSibling);
    var ticking = false;
    function update() {
      ticking = false;
      var mid = cf.scrollLeft + cf.clientWidth / 2;
      var best = 0, bestD = Infinity;
      items.forEach(function (it, i) {
        var d = (it.offsetLeft + it.offsetWidth / 2 - mid) / it.offsetWidth;
        var a = Math.min(Math.abs(d), 1);
        it.style.setProperty('--sc', (1 - a * 0.15).toFixed(3));
        it.style.setProperty('--ry', (clamp(d, -1, 1) * -16).toFixed(2) + 'deg');
        it.style.setProperty('--op', (1 - a * 0.42).toFixed(3));
        if (Math.abs(d) < bestD) { bestD = Math.abs(d); best = i; }
      });
      dots.forEach(function (dot, i) { dot.classList.toggle('on', i === best); });
    }
    cf.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ribbons: pause while touched */
  $$('.ribbon').forEach(function (rb) {
    var t;
    var pause = function () { clearTimeout(t); rb.classList.add('is-paused'); };
    var resume = function () { clearTimeout(t); t = setTimeout(function () { rb.classList.remove('is-paused'); }, 1200); };
    rb.addEventListener('pointerdown', pause);
    rb.addEventListener('pointerup', resume);
    rb.addEventListener('pointercancel', resume);
    rb.addEventListener('pointerleave', resume);
  });

  /* =====================================================================
     LIGHTBOX
     ===================================================================== */
  var lb = $('#lightbox');
  var lbImg = $('#lightboxImg');
  var lbCount = $('#lightboxCount');
  var lbIdx = 0;
  var lbReturn = null;
  function lbShow(i) {
    lbIdx = (i + LB.length) % LB.length;
    var src = PHOTO_DIR + LB[lbIdx] + '-1400.webp';
    lbImg.classList.add('is-swap');
    var pre = new Image();
    pre.onload = pre.onerror = function () {
      lbImg.src = src;
      lbImg.alt = ALT;
      lbImg.classList.remove('is-swap');
    };
    pre.src = src;
    lbCount.textContent = (lbIdx + 1) + ' / ' + LB.length;
    [1, -1].forEach(function (o) {              // warm the neighbours
      new Image().src = PHOTO_DIR + LB[(lbIdx + o + LB.length) % LB.length] + '-1400.webp';
    });
  }
  function lbOpen(i, from) {
    lbReturn = from || null;
    lb.hidden = false;
    lb.setAttribute('aria-hidden', 'false');
    root.style.overflow = 'hidden';
    lbShow(i);
    requestAnimationFrame(function () { lb.classList.add('is-on'); });
    $('.lightbox__close', lb).focus({ preventScroll: true });
  }
  function lbClose() {
    lb.classList.remove('is-on');
    lb.setAttribute('aria-hidden', 'true');
    root.style.overflow = '';
    setTimeout(function () { lb.hidden = true; }, 350);
    if (lbReturn && lbReturn.focus) lbReturn.focus({ preventScroll: true });
  }
  gallery.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-lb]') : null;
    if (b) lbOpen(parseInt(b.getAttribute('data-lb'), 10), b);
  });
  $('.lightbox__close', lb).addEventListener('click', lbClose);
  $('.lightbox__nav--prev', lb).addEventListener('click', function () { lbShow(lbIdx - 1); });
  $('.lightbox__nav--next', lb).addEventListener('click', function () { lbShow(lbIdx + 1); });
  lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target.classList.contains('lightbox__fig')) lbClose();
  });
  doc.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') lbClose();
    else if (e.key === 'ArrowLeft') lbShow(lbIdx - 1);
    else if (e.key === 'ArrowRight') lbShow(lbIdx + 1);
  });
  var tx = 0, ty = 0;
  lb.addEventListener('touchstart', function (e) {
    tx = e.changedTouches[0].clientX;
    ty = e.changedTouches[0].clientY;
  }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - tx;
    var dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) lbShow(lbIdx + (dx < 0 ? 1 : -1));
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.3) lbClose();
  }, { passive: true });

  /* =====================================================================
     FILMS
     ===================================================================== */
  /* background music: plays only when the guest wants it, no film is playing and the page is on screen */
  var audio = null;
  var musicBtn = $('#musicBtn');
  var musicWanted = false;
  var filmSounding = false;
  function musicUpdate() {
    if (!audio) return;
    if (musicWanted && !filmSounding && !doc.hidden) {
      var p = audio.play();
      if (p && p.catch) p.catch(function () {});
    } else {
      audio.pause();
    }
  }
  var films = W.films || [];
  var filmsEl = $('#films');
  if (films.length) {
    $('#filmTitle').innerHTML = (films.length === 1 ? (films[0].title || 'Our Film') : 'Our Films')
      .split(' ').map(function (w) { return '<span class="nw">' + esc(w) + '</span>'; }).join(' ');
    // one player; with several films, thumbnails underneath switch what it shows
    var multi = films.length > 1;
    filmsEl.innerHTML =
      '<div class="film" data-reveal="zoom"></div>' +
      (multi
        ? '<p class="film__now" aria-live="polite"></p>' +
          '<div class="film-tabs" role="tablist" aria-label="Choose a film" data-reveal>' +
          films.map(function (f, i) {
            return '<button class="film-tab" type="button" role="tab" data-film="' + i + '">' +
              '<span class="film-tab__img">' +
              (f.poster ? '<img src="' + esc(f.poster) + '" alt="" loading="lazy" decoding="async" />' : '') +
              '<i></i></span>' +
              '<span class="film-tab__t">' + esc(f.title || 'Film ' + (i + 1)) + '</span>' +
              (f.length ? '<span class="film-tab__d">' + esc(f.length) + '</span>' : '') +
              '</button>';
          }).join('') + '</div>'
        : '');
    var filmBox = $('.film', filmsEl);
    var filmNow = $('.film__now', filmsEl);
    var filmTabs = $$('.film-tab', filmsEl);
    var filmCur = 0;
    var filmMain = null;          // the full film's <video>, once play is pressed
    var filmTeaser = null;        // the silent loop shown before that
    var filmVisible = false;

    var syncTeaser = function () {
      var f = films[filmCur];
      if (filmMain || !filmTeaser || !f.teaser || reduceMotion) return;
      if (filmVisible) {
        if (!filmTeaser.getAttribute('src')) filmTeaser.src = f.teaser;
        var p = filmTeaser.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        filmTeaser.pause();
      }
    };
    var playFilm = function () {
      if (filmMain) return;
      var f = films[filmCur];
      filmMain = doc.createElement('video');
      filmMain.controls = true;
      filmMain.playsInline = true;
      filmMain.setAttribute('playsinline', '');
      filmMain.preload = 'auto';
      if (f.poster) filmMain.poster = f.poster;
      filmMain.src = f.src;
      filmTeaser.pause();
      filmTeaser.replaceWith(filmMain);
      filmBox.classList.add('is-playing');
      // the music steps aside while a film has sound, and comes back when it stops
      filmMain.addEventListener('play', function () { filmSounding = true; musicUpdate(); });
      ['pause', 'ended'].forEach(function (ev) {
        filmMain.addEventListener(ev, function () { filmSounding = false; musicUpdate(); });
      });
      if (multi) {
        // when one film ends, line up the next one
        filmMain.addEventListener('ended', function () { showFilm((filmCur + 1) % films.length, false); });
      }
      var p = filmMain.play();
      if (p && p.catch) p.catch(function () { /* the native play button still works */ });
    };
    var showFilm = function (i, autoplay) {
      var f = films[i];
      if (filmMain) {
        filmMain.pause();
        filmMain.removeAttribute('src');
        filmMain.load();
        filmMain = null;
        filmSounding = false;
        musicUpdate();
      }
      filmCur = i;
      filmBox.classList.remove('is-playing');
      filmBox.innerHTML =
        '<video class="film__teaser" muted loop playsinline preload="none"' + (f.poster ? ' poster="' + esc(f.poster) + '"' : '') + '></video>' +
        '<button class="film__play" type="button" aria-label="Play ' + esc(f.title || 'film') + ' with sound">' +
        '<i></i><span class="film__label">Tap to play with sound</span></button>';
      filmTeaser = $('.film__teaser', filmBox);
      $('.film__play', filmBox).addEventListener('click', playFilm);
      filmTabs.forEach(function (t, k) {
        t.classList.toggle('is-on', k === i);
        t.setAttribute('aria-selected', k === i ? 'true' : 'false');
      });
      if (filmNow) filmNow.textContent = f.title || '';
      if (autoplay) playFilm(); else syncTeaser();
    };
    filmTabs.forEach(function (t) {
      t.addEventListener('click', function () { showFilm(parseInt(t.getAttribute('data-film'), 10), true); });
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        filmVisible = en[0].isIntersecting;
        if (filmMain) { if (!filmVisible && !filmMain.paused) filmMain.pause(); return; }
        syncTeaser();
      }, { threshold: 0.25 }).observe(filmBox);
    }
    showFilm(0, false);
  } else {
    $('#film').hidden = true;
  }

  /* =====================================================================
     RSVP · SHARE · MUSIC
     ===================================================================== */
  var rsvp = W.rsvp || {};
  var wa = String(rsvp.whatsapp || '').replace(/\D/g, '');
  if (wa) {
    var rb = $('#rsvpBtn');
    rb.href = 'https://wa.me/' + wa + '?text=' + encodeURIComponent('Namaste! I would love to join the wedding celebrations of ' + NAMES + '.');
    rb.hidden = false;
  }
  $('#shareBtn').addEventListener('click', function () {
    var url = location.href.split('#')[0].split('?')[0];
    var data = { title: doc.title, text: NAMES + ' — Wedding Invitation', url: url };
    if (navigator.share) {
      navigator.share(data).catch(function () {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { toast('Invitation link copied'); }, function () { toast(url); });
    } else {
      window.open('https://wa.me/?text=' + encodeURIComponent(data.text + ' ' + url), '_blank', 'noopener');
    }
  });
  if (W.music) {
    audio = new Audio(W.music);
    audio.loop = true;
    audio.preload = 'none';
    audio.volume = 0.85;   // iPhones ignore this, so the file itself is also mastered a little quieter
    musicBtn.hidden = false;
    // the button's animated bars follow what is actually audible
    ['play', 'pause'].forEach(function (ev) {
      audio.addEventListener(ev, function () { musicBtn.setAttribute('aria-pressed', audio.paused ? 'false' : 'true'); });
    });
    musicBtn.addEventListener('click', function () {
      musicWanted = audio.paused;
      // turning the music on while a film is playing pauses the film, so the two never overlap
      if (musicWanted && filmSounding) $$('.film video').forEach(function (v) { if (v.controls) v.pause(); });
      musicUpdate();
    });
    doc.addEventListener('visibilitychange', musicUpdate);   // silent when the guest switches apps
  }

  /* =====================================================================
     DOCK (quick navigation)
     ===================================================================== */
  var dock = $('#dock');
  var navSections = $$('[data-nav]').filter(function (s) { return !s.hidden; });
  dock.innerHTML = navSections.map(function (s) {
    return '<a href="#' + s.id + '">' + esc(s.getAttribute('data-nav')) + '</a>';
  }).join('');
  var dockLinks = $$('a', dock);

  /* =====================================================================
     SPARKLES
     ===================================================================== */
  $$('.sparkles').forEach(function (box) {
    var n = window.innerWidth < 700 ? 14 : 26;
    var html = '';
    for (var i = 0; i < n; i++) {
      var sz = rand(6, 13).toFixed(1);
      html += '<i style="left:' + rand(3, 97).toFixed(1) + '%;top:' + rand(4, 96).toFixed(1) + '%;width:' + sz + 'px;height:' + sz +
        'px;--dur:' + rand(2.6, 5.2).toFixed(2) + 's;--delay:-' + rand(0, 5).toFixed(2) + 's"></i>';
    }
    box.innerHTML = html;
  });

  /* =====================================================================
     SCROLL: reveal · progress · parallax · timeline · dock
     ===================================================================== */
  var revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          revealIO.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    revealEls.forEach(function (el) { revealIO.observe(el); });

    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        dockLinks.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navSections.forEach(function (s) { navIO.observe(s); });

    // decorative animations only run while their section is near the screen
    var liveIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target.classList.toggle('is-live', en.isIntersecting); });
    }, { rootMargin: '15% 0px' });
    $$('.live').forEach(function (s) { liveIO.observe(s); });

    // ribbons only drift while on screen
    var ribbonIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target.classList.toggle('is-paused', !en.isIntersecting); });
    });
    var ribbonLoadIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        $$('img', en.target).forEach(function (im) { im.loading = 'eager'; });
        ribbonLoadIO.unobserve(en.target);
      });
    }, { rootMargin: '120% 0px' });
    $$('.ribbon').forEach(function (r) { ribbonIO.observe(r); ribbonLoadIO.observe(r); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
    $$('.live').forEach(function (s) { s.classList.add('is-live'); });
  }

  var progressBar = $('#progressBar');
  var parallaxEls = $$('[data-parallax]');
  var hero = $('.hero');
  var heroFrame = $('.hero__frame');
  var heroContent = $('.hero__content');
  var heroH = hero.offsetHeight;
  var isWide = window.innerWidth >= 900;
  var scrollTick = false;
  function onScroll() {
    scrollTick = false;
    var y = window.pageYOffset || root.scrollTop;
    var vh = window.innerHeight;
    var max = Math.max(1, root.scrollHeight - vh);
    progressBar.style.transform = 'scaleX(' + clamp(y / max, 0, 1).toFixed(4) + ')';
    dock.classList.toggle('is-on', y > heroH * 0.6);

    if (!reduceMotion && y < heroH * 1.1) {
      // the photo drifts slower than the page; the names lift and fade as you scroll away
      var hp = clamp(y / heroH, 0, 1);
      heroFrame.style.transform = isWide ? '' : 'translate3d(0,' + (y * 0.28).toFixed(1) + 'px,0)';
      heroContent.style.transform = 'translate3d(0,' + (-hp * 46).toFixed(1) + 'px,0)';
      heroContent.style.opacity = (1 - hp * 1.25).toFixed(3);
    }
    if (!reduceMotion) {
      parallaxEls.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -80 || r.top > vh + 80) return;
        var prog = (r.top + r.height / 2 - vh / 2) / vh;
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
        el.style.transform = 'translate3d(0,' + (-prog * speed * r.height).toFixed(1) + 'px,0)';
      });
    }
    var fill = $('#timelineFill');
    if (fill) {
      var tr = timeline.getBoundingClientRect();
      fill.style.transform = 'scaleY(' + clamp((vh * 0.6 - tr.top) / Math.max(1, tr.height), 0, 1).toFixed(4) + ')';
    }
  }
  window.addEventListener('scroll', function () {
    if (!scrollTick) { scrollTick = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  var resizeT;
  window.addEventListener('resize', function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      heroH = hero.offsetHeight;
      isWide = window.innerWidth >= 900;
      buildToran();
      onScroll();
    }, 200);
  });
  onScroll();

  /* =====================================================================
     PETALS (canvas)
     ===================================================================== */
  var petals = (function () {
    var canvas = $('#petals');
    if (!canvas || reduceMotion || !canvas.getContext) return { burst: function () {}, start: function () {}, puff: function () {} };
    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, dpr = 1, list = [], running = false, last = 0;
    var TONES = [
      ['#ffe08a', '#f5a81c'], ['#ffc247', '#e8730c'], ['#ffd257', '#f08c12'],
      ['#ff9d7a', '#c9382f'], ['#fff3d2', '#efcf8c']
    ];
    var sprites = TONES.map(function (t) {
      var c = doc.createElement('canvas');
      c.width = c.height = 48;
      var x = c.getContext('2d');
      var g = x.createLinearGradient(8, 4, 40, 44);
      g.addColorStop(0, t[0]);
      g.addColorStop(1, t[1]);
      x.fillStyle = g;
      x.beginPath();
      x.moveTo(24, 3);
      x.bezierCurveTo(42, 12, 44, 34, 24, 45);
      x.bezierCurveTo(4, 34, 6, 12, 24, 3);
      x.fill();
      x.strokeStyle = 'rgba(255,255,255,.35)';
      x.lineWidth = 1.2;
      x.beginPath();
      x.moveTo(24, 8);
      x.quadraticCurveTo(27, 24, 24, 40);
      x.stroke();
      return c;
    });
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function make(burst) {
      var big = w >= 700 ? 1.25 : 1;
      return {
        x: rand(0, w),
        y: burst ? rand(-h * 0.35, -12) : rand(-h, -12),
        s: rand(9, 19) * big,
        vy: rand(28, 60) * (burst ? rand(1.8, 3) : 1),
        vx: rand(-12, 12),
        sw: rand(0.6, 1.7), amp: rand(8, 26), ph: rand(0, 6.28),
        rot: rand(0, 6.28), vr: rand(-1.5, 1.5),
        fl: rand(0, 6.28), vf: rand(1, 3.2),
        a: rand(0.6, 0.95),
        sp: sprites[(Math.random() * sprites.length) | 0],
        burst: !!burst
      };
    }
    function frame(now) {
      if (!running) return;
      var dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (var i = list.length - 1; i >= 0; i--) {
        var p = list[i];
        if (p.g) { p.vy += p.g * dt; p.vx = p.vx * 0.985; }
        p.y += p.vy * dt;
        p.x += p.vx * dt;
        p.ph += p.sw * dt;
        p.rot += p.vr * dt;
        p.fl += p.vf * dt;
        if (p.y > h + 24) {
          if (p.burst) { list.splice(i, 1); continue; }
          p.y = rand(-60, -12);
          p.x = rand(0, w);
        }
        var x = p.x + Math.sin(p.ph) * p.amp;
        ctx.save();
        ctx.translate(x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, 0.3 + 0.7 * Math.abs(Math.cos(p.fl)));
        ctx.globalAlpha = p.a;
        ctx.drawImage(p.sp, -p.s / 2, -p.s / 2, p.s, p.s);
        ctx.restore();
      }
      requestAnimationFrame(frame);
    }
    function start() {
      if (running) return;
      resize();
      var base = w < 700 ? 14 : 26;
      while (list.length < base) list.push(make(false));
      running = true;
      last = performance.now();
      requestAnimationFrame(frame);
    }
    window.addEventListener('resize', resize);
    doc.addEventListener('visibilitychange', function () {
      if (doc.hidden) { running = false; }
      else if (list.length) { running = true; last = performance.now(); requestAnimationFrame(frame); }
    });
    return {
      start: start,
      burst: function (n) {
        start();
        for (var i = 0; i < n; i++) list.push(make(true));
      },
      // a small puff of petals from a point (used for taps)
      puff: function (x, y, n) {
        if (!running || list.length > 140) return;
        for (var i = 0; i < n; i++) {
          var p = make(true);
          var ang = rand(-Math.PI, 0);
          var sp = rand(40, 150);
          p.x = x;
          p.y = y;
          p.vx = Math.cos(ang) * sp;
          p.vy = Math.sin(ang) * sp;
          p.g = rand(160, 260);
          p.amp = rand(2, 8);
          p.s = p.s * 0.85;
          list.push(p);
        }
      }
    };
  })();

  /* =====================================================================
     COVER — open the doors
     ===================================================================== */
  var gate = $('#gate');
  var opened = false;
  function openGate(instant) {
    if (opened) return;
    opened = true;
    root.classList.remove('is-locked');
    doc.body.classList.add('is-open');
    if (instant) {
      gate.remove();
    } else {
      gate.classList.add('is-open');
      setTimeout(function () { gate.remove(); }, 2200);
    }
    petals.burst(window.innerWidth < 700 ? 38 : 70);
    startHero();
    musicWanted = true;            // the opening tap is the gesture browsers need before sound may start
    musicUpdate();
  }
  $('#openBtn').addEventListener('click', function () { openGate(false); });
  gate.addEventListener('click', function (e) {
    // tapping anywhere on the cover opens it too
    if (!(e.target.closest && e.target.closest('#openBtn'))) openGate(false);
  });
  if (/[?&]skipintro\b/.test(location.search)) openGate(true);

  /* a photo that fails to load (patchy mobile data, a momentary server hiccup) gets two more tries */
  doc.addEventListener('error', function (e) {
    var im = e.target;
    if (!im || im.tagName !== 'IMG' || !im.getAttribute('src')) return;
    var tries = parseInt(im.getAttribute('data-retry') || '0', 10);
    if (tries >= 2) return;
    im.setAttribute('data-retry', String(tries + 1));
    setTimeout(function () {
      var src = im.getAttribute('src');
      var set = im.getAttribute('srcset');
      if (set) { im.removeAttribute('srcset'); im.setAttribute('srcset', set); }
      im.src = src;                              // assigning again starts a fresh request
    }, 1500 * (tries + 1));
  }, true);

  /* a tap on any empty spot scatters a few petals */
  doc.addEventListener('pointerdown', function (e) {
    if (!opened || !lb.hidden) return;
    if (e.target.closest && e.target.closest('a, button, video, .dock')) return;
    petals.puff(e.clientX, e.clientY, 7);
  }, { passive: true });

  /* keep the page behind the photo viewer from scrolling on iOS */
  lb.addEventListener('touchmove', function (e) {
    if (e.touches.length === 1) e.preventDefault();
  }, { passive: false });
})();
