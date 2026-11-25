/* =====================================================================
   WEDDING DETAILS — GROOM'S-SIDE CARD  (…/vikas-weds-aditi/)

   This card has its own details (this file), its own look (css/theme.css)
   and its own send page (send.html). Everything else — photos, films,
   music, the main stylesheet and the script — is borrowed from the
   bride's-side card in ../aditi-vikas/, so nothing is stored twice.

   • Anything left as ""  is shown as "To be announced" or is hidden.
   • Photo values are photo numbers; the files live in
     ../aditi-vikas/assets/photos/<number>-800.webp / -1400.webp.
   • If the names change, also update the <title> and og: tags at the
     top of index.html (link previews cannot read this file).
   • A change to dates, venue or functions usually belongs in BOTH
     cards' config.js files.
   ===================================================================== */
window.WEDDING = {

  side: "groom",

  /* Where "assets/…" paths below are loaded from (the bride's-side card's folder). */
  assetBase: "../aditi-vikas/",

  /* Flourishes switched off on this card to keep it plainer than the bride's-side one.
     Delete a line (or set it to true) to bring that effect back. */
  effects: {
    petals:   false,     // falling petals
    toran:    false,     // marigold garland across the top
    sparkles: false      // twinkles on the dark sections
  },

  /* ---------- The couple (shown in this order everywhere) ---------- */
  couple: {
    first:  { name: "Vikas", role: "The Groom", parents: "Son of Mr. Barun Kumar & Mrs. Neelam Singh", photo: "6923" },
    second: { name: "Aditi", role: "The Bride", parents: "Daughter of Mr. Pranay Thakur & Mrs. Ritu Singh", photo: "6826" }
  },

  /* ---------- Traditional lines (set to "" to hide) ---------- */
  invocation: "॥ श्री गणेशाय नमः ॥",
  shubh:      "॥ शुभ विवाह ॥",

  /* ---------- Main wedding date ----------
     Date only      → "2026-12-09"                 (countdown runs to the start of that day, India time)
     Date + time    → "2026-12-09T20:00:00+05:30"  (countdown runs to that exact time; +05:30 = India)
     The year was not stated — 2026 is assumed. Change it here if needed.  */
  date: "2026-12-09T20:00:00+05:30",
  timeText: "8 PM onwards",       // wording shown next to the date; "" shows the clock time from `date` instead
  city: "",                       // e.g. "Mumbai" — shown under the date

  /* ---------- Main venue (section is hidden while name is "") ---------- */
  // name and address are exactly as Google Maps gives them for the shared map link
  venue: {
    name: "Chawla Greens",
    address: "Khaira, Chhattisgarh 495006",
    mapUrl: "https://maps.app.goo.gl/gfQuq8wy382hPCR86"
  },

  /* ---------- Functions ----------
     Copied as-is from the bride's-side card. If the groom's side has a different
     list (for example a different Mehndi, or none), edit it here.
     icon: haldi | carnival | mehndi | sangeet | wedding | reception | lotus
     date: "YYYY-MM-DD"   time: any text, e.g. "Evening" or "7:00 PM"
     venue / mapUrl left "" → card shows "Venue to be announced".
     note: a short tagline — reword or set to "" to remove.            */
  events: [
    { icon: "mehndi",   name: "Mehndi",   note: "Henna, music and the colours of celebration.",     date: "2026-12-07", time: "Evening", venue: "At Residence",          mapUrl: "" },
    { icon: "carnival", name: "Carnival", note: "Fun, games and laughter with family and friends.", date: "2026-12-08", time: "12 PM onwards", venue: "Chawla Greens, Khaira", mapUrl: "https://maps.app.goo.gl/gfQuq8wy382hPCR86" },
    { icon: "sangeet",  name: "Sangeet",  note: "An evening of song, dance and family.",            date: "2026-12-08", time: "8 PM onwards",  venue: "Chawla Greens, Khaira", mapUrl: "https://maps.app.goo.gl/gfQuq8wy382hPCR86" },
    { icon: "wedding",  name: "Wedding",  note: "Two families become one.",                         date: "2026-12-09", time: "8 PM onwards",  venue: "Chawla Greens, Khaira", mapUrl: "https://maps.app.goo.gl/gfQuq8wy382hPCR86" }
  ],

  /* ---------- RSVP (button is hidden while whatsapp is "") ----------
     whatsapp: country code + number, digits only, e.g. "919876543210" */
  rsvp: { whatsapp: "", contactName: "" },

  /* ---------- Personal invitations ----------
     A link ending in  ?to=Sharma%20Family  shows that name on the cover,
     above the "Open Invitation" button. The easy way to make such links
     and send them is the helper page:  …/vikas-weds-aditi/send.html      */
  guestLabel: "A special invitation for",

  /* The WhatsApp message offered by send.html (groom's parents' voice).
     {name} = the family's name   {link} = their personal link
     *stars* make text bold in WhatsApp.                                 */
  whatsappMessage: [
    "🙏 Namaste {name} 🙏",
    "",
    "With the blessings of our elders, we joyfully invite you and your family to the wedding of our son",
    "",
    "✨ *Vikas* with *Aditi* ✨",
    "",
    "🗓️ *Wednesday, 9 December 2026 · 8 PM onwards*",
    "Celebrations begin on 7 December",
    "📍 *Chawla Greens, Khaira, Chhattisgarh*",
    "",
    "💌 Your invitation is here:",
    "{link}",
    "",
    "Your presence and blessings will mean the world to us.",
    "",
    "With warm regards,",
    "*Barun Kumar & Neelam Singh*"
  ].join("\n"),

  /* ---------- Photos ---------- */
  heroPhotos:   ["9001", "6905", "9018"],
  invitePhoto:  "9014",
  // photo behind the quote / the closing note: tall one for phones, wide one for laptops
  quotePhoto:   { tall: "9006", wide: "9003" },
  closingPhoto: { tall: "8859", wide: "9021" },
  // landscape photos (so the gallery can give them a wide tile)
  widePhotos:   ["9003", "9004", "9021", "7010", "7154", "7160"],

  // layout: "grid" | "coverflow" | "ribbon".   note: small line under the title ("" to hide)
  gallery: [
    { title: "The Ring Ceremony",      layout: "grid", note: "8 July 2026",
      photos: ["7010", "6912", "7392", "7154", "6884", "6928", "7402", "7403", "7160", "7443", "7455", "6902", "7447"] },
    { title: "Whispers of the Woods",  layout: "coverflow",
      photos: ["8856", "8842", "8843", "8845", "8846", "8847", "8851", "8855", "8858", "8849", "8860"] },
    { title: "Golden Hour by the Sea", layout: "ribbon",
      photos: ["8993", "8999", "9005", "9010", "9012", "8998", "8994", "9002", "9007", "9011", "8996", "8995"] },
    { title: "Rooted in Tradition",    layout: "grid",
      photos: ["9015", "9016", "9017", "9019", "9021", "9022", "9023"] }
  ],

  /* ---------- Films ----------
     The first one is shown first; the others appear as thumbnails to tap.
     teaser = short silent loop shown before play ("" to skip).          */
  films: [
    { title:  "Rooted in Tradition",    length: "1:46",
      src:    "assets/video/film.mp4",
      teaser: "assets/video/teaser.mp4",
      poster: "assets/video/poster.webp" },
    { title:  "Golden Hour by the Sea", length: "0:58",
      src:    "assets/video/film-sea.mp4",
      teaser: "assets/video/film-sea-teaser.mp4",
      poster: "assets/video/film-sea-poster.webp" },
    { title:  "Whispers of the Woods",  length: "1:08",
      src:    "assets/video/film-woods.mp4",
      teaser: "assets/video/film-woods-teaser.mp4",
      poster: "assets/video/film-woods-poster.webp" }
  ],

  /* ---------- Background music ("" for none) ---------- */
  music: "assets/music.mp3"
};
