/* =====================================================================
   WEDDING DETAILS  —  this is the only file you need to edit.

   • Anything left as ""  is shown on the page as "To be announced"
     or is hidden, so nothing made-up ever appears on the invitation.
   • Photo values are the photo numbers from the shared Drive folders
     (files live in assets/photos/<number>-800.webp / -1400.webp).
     Available: all 50 pre-wedding photos (IMG_8841 … IMG_9023) and 16
     picked from the 455 ring-ceremony photos (DSC06826 … DSC07455).
   • If the names change, also update the <title> and og: tags at the
     top of index.html (link previews cannot read this file).
   ===================================================================== */
window.WEDDING = {

  /* ---------- The couple (shown in this order everywhere) ---------- */
  couple: {
    first:  { name: "Vikas", role: "The Groom", parents: "Son of Mr. Barun Kumar & Mrs. Neelam Singh", photo: "6923" },
    second: { name: "Aditi", role: "The Bride", parents: "Daughter of Mr. Pranay Thakur & Mrs. Ritu Singh", photo: "6826" }
    // parents example:  "Son of Mr. … & Mrs. …"
  },

  /* ---------- Traditional lines (set to "" to hide) ---------- */
  invocation: "॥ श्री गणेशाय नमः ॥",
  shubh:      "॥ शुभ विवाह ॥",

  /* ---------- Main wedding date ----------
     Date only      → "2026-12-09"                 (countdown runs to the start of that day, India time)
     Date + time    → "2026-12-09T19:00:00+05:30"  (countdown runs to that exact time)
     The year was not stated — 2026 is assumed. Change it here if needed.  */
  date: "2026-12-09",
  timeText: "Evening",            // shown next to the date while no exact time is set ("" to hide)
  city: "",                       // e.g. "Mumbai" — shown under the date

  /* ---------- Main venue (section is hidden while name is "") ---------- */
  // name and address are exactly as Google Maps gives them for the shared map link
  venue: {
    name: "Chawla Greens",
    address: "Khaira, Chhattisgarh 495006",
    mapUrl: "https://maps.app.goo.gl/gfQuq8wy382hPCR86"
  },

  /* ---------- Functions ----------
     icon: haldi | carnival | mehndi | sangeet | wedding | reception | lotus
     date: "YYYY-MM-DD"   time: any text, e.g. "Evening" or "7:00 PM"
     venue / mapUrl left "" → card shows "Venue to be announced".
     note: a short tagline — reword or set to "" to remove.            */
  events: [
    { icon: "haldi",    name: "Haldi",    note: "A splash of turmeric, laughter and blessings.", date: "2026-12-07", time: "",                venue: "", mapUrl: "" },
    { icon: "carnival", name: "Carnival", note: "Fun, games and laughter with family and friends.", date: "2026-12-08", time: "Morning to noon", venue: "", mapUrl: "" },
    { icon: "mehndi",   name: "Mehndi",   note: "Henna, music and the colours of celebration.",  date: "2026-12-08", time: "Evening",         venue: "", mapUrl: "" },
    { icon: "wedding",  name: "Wedding",  note: "Two families become one.",                      date: "2026-12-09", time: "Evening",         venue: "Chawla Greens, Khaira", mapUrl: "https://maps.app.goo.gl/gfQuq8wy382hPCR86" }
  ],

  /* ---------- RSVP (button is hidden while whatsapp is "") ----------
     whatsapp: country code + number, digits only, e.g. "919876543210" */
  rsvp: { whatsapp: "", contactName: "" },

  /* ---------- Personal invitations ----------
     A link ending in  ?to=Sharma%20Family  shows that name on the cover,
     above the "Open Invitation" button. The easy way to make such links
     and send them is the helper page:  …/vikas-aditi/send.html          */
  guestLabel: "A special invitation for",

  /* The WhatsApp message offered by send.html.
     {name} = the family's name   {link} = their personal link
     *stars* make text bold in WhatsApp.                                 */
  whatsappMessage: [
    "🙏 Namaste {name} 🙏",
    "",
    "With the blessings of our elders, we joyfully invite you and your family to the wedding of our daughter",
    "",
    "✨ *Aditi* with *Vikas* ✨",
    "",
    "🗓️ *Wednesday, 9 December 2026*",
    "Celebrations begin on 7 December",
    "📍 *Chawla Greens, Khaira, Chhattisgarh*",
    "",
    "💌 Your invitation is here:",
    "{link}",
    "",
    "Your presence and blessings will mean the world to us.",
    "",
    "With warm regards,",
    "*Pranay Thakur & Ritu Singh*"
  ].join("\n"),

  /* ---------- Photos ---------- */
  heroPhotos:   ["9018", "6905", "9001", "9020"],
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

  /* ---------- Background music (optional) ----------
     Put an .mp3 you have the rights to in assets/ and set e.g. "assets/music.mp3".
     It starts when the guest opens the cover, loops quietly, steps aside
     while a film plays and stops when they leave the page. A music on/off
     button appears only when this is filled in.                        */
  music: "assets/music.mp3"
};
