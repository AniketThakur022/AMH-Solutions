/* Script for send.html — builds a personal link and WhatsApp message for one guest.
   Shared by both cards: everything card-specific comes from that card's js/config.js
   and from the address this page is opened at. */
(function () {
  'use strict';
  var W = window.WEDDING || {};
  var $ = function (id) { return document.getElementById(id); };
  // the invitation's address, wherever this page happens to be hosted
  var BASE = new URL('./', location.href).href;
  var DEFAULT = W.whatsappMessage || 'Namaste {name},\n\nYou are invited:\n{link}';
  var LABEL = W.guestLabel || 'A special invitation for';
  var couple = W.couple || {};
  var NAMES = [couple.first && couple.first.name, couple.second && couple.second.name].filter(Boolean).join(' & ');
  // each card remembers its own edited wording (bride's and groom's messages differ)
  var KEY = 'wedding-invite-message-v1:' + (W.side || NAMES || 'card');

  // make it obvious which card this page sends
  var SIDE = { bride: "From the bride's family", groom: "From the groom's family" }[W.side] || 'For the family';
  if ($('side')) $('side').textContent = SIDE;
  if ($('whose')) $('whose').textContent = NAMES;
  if (NAMES) document.title = 'Send invitations — ' + NAMES;

  var nameEl = $('name'), phoneEl = $('phone'), msgEl = $('msg');

  // same tidy-up the invitation applies to the name
  function cleanName(v) {
    return String(v || '').replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
  }
  function linkFor(name) { return name ? BASE + '?to=' + encodeURIComponent(name) : BASE; }
  function fill(tpl, name, link) {
    return tpl
      .replace(/ ?\{name\}/g, function (m) { return name ? (m.charAt(0) === ' ' ? ' ' : '') + name : ''; })
      .replace(/\{link\}/g, link);
  }
  function load() {
    try {
      // wording saved before the two cards got separate keys belonged to the bride's card
      return localStorage.getItem(KEY) || (W.side === 'groom' ? '' : localStorage.getItem('wedding-invite-message-v1')) || '';
    } catch (e) { return ''; }
  }
  function save(v) { try { if (v === DEFAULT) localStorage.removeItem(KEY); else localStorage.setItem(KEY, v); } catch (e) {} }
  function say(t) {
    $('status').textContent = t;
    clearTimeout(say.t);
    say.t = setTimeout(function () { $('status').textContent = ''; }, 2600);
  }
  function fallbackCopy(text, done) {
    var t = document.createElement('textarea');
    t.value = text;
    t.setAttribute('readonly', '');
    t.style.position = 'fixed';
    t.style.opacity = '0';
    document.body.appendChild(t);
    t.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    t.remove();
    say(ok ? done : 'Could not copy — press and hold the text to copy it.');
  }
  function copy(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { say(done); }, function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }

  var current = { name: '', link: BASE, text: '' };
  function update() {
    var name = cleanName(nameEl.value);
    var link = linkFor(name);
    var text = fill(msgEl.value, name, link);
    current = { name: name, link: link, text: text };
    $('coverPreview').textContent = name ? LABEL + ' — ' + name : 'no name (the standard cover)';
    $('out').textContent = text;
    var digits = phoneEl.value.replace(/\D/g, '');
    $('wa').href = 'https://wa.me/' + digits + '?text=' + encodeURIComponent(text);
    $('open').href = link;
  }

  msgEl.value = load() || DEFAULT;
  nameEl.addEventListener('input', update);
  phoneEl.addEventListener('input', update);
  msgEl.addEventListener('input', function () { save(msgEl.value); update(); });
  $('reset').addEventListener('click', function () { msgEl.value = DEFAULT; save(DEFAULT); update(); say('Wording reset.'); });
  $('copyMsg').addEventListener('click', function () { copy(current.text, 'Message copied.'); });
  $('copyLink').addEventListener('click', function () { copy(current.link, 'Link copied.'); });
  update();
})();
