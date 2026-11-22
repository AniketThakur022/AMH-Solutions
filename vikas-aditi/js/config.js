/* =====================================================================
   WEDDING DETAILS  —  this is the only file you need to edit.

   • Anything left as ""  is shown on the page as "To be announced"
     or is hidden, so nothing made-up ever appears on the invitation.
   • Photo values are the IMG_ numbers from the shared Drive folder
     (files live in assets/photos/<number>-800.webp / -1400.webp).
     All 50 photos from the folder are available, so any number works.
   • If the names change, also update the <title> and og: tags at the
     top of index.html (link previews cannot read this file).
   ===================================================================== */
window.WEDDING = {

  /* ---------- The couple (shown in this order everywhere) ---------- */
  couple: {
    first:  { name: "Vikas", role: "The Groom", parents: "", photo: "8995" },
    second: { name: "Aditi", role: "The Bride", parents: "", photo: "8998" }
    // parents example:  "Son of Mrs. … & Mr. …"
  },

  /* ---------- Traditional lines (set to "" to hide) ---------- */
  invocation: "॥ श्री गणेशाय नमः ॥",
  shubh:      "॥ शुभ विवाह ॥",

  /* ---------- Main wedding date ----------
     ISO format with India time zone, e.g. "2027-02-14T19:00:00+05:30".
     Leave "" until the date is confirmed (countdown stays hidden).   */
  date: "",
  city: "",                       // e.g. "Mumbai" — shown under the date

  /* ---------- Main venue (section is hidden while name is "") ---------- */
  venue: { name: "", address: "", mapUrl: "" },

  /* ---------- Functions ----------
     SAMPLE LIST — replace with the real functions, or delete rows.
     icon: haldi | mehndi | sangeet | wedding | reception | lotus
     date/time/venue/mapUrl left "" → card shows "To be announced". */
  events: [
    { icon: "haldi",     name: "Haldi",     note: "A splash of turmeric, laughter and blessings.", date: "", time: "", venue: "", mapUrl: "" },
    { icon: "mehndi",    name: "Mehndi",    note: "Henna, music and the colours of celebration.",  date: "", time: "", venue: "", mapUrl: "" },
    { icon: "sangeet",   name: "Sangeet",   note: "An evening of song, dance and family.",         date: "", time: "", venue: "", mapUrl: "" },
    { icon: "wedding",   name: "Wedding",   note: "Two families become one.",                      date: "", time: "", venue: "", mapUrl: "" },
    { icon: "reception", name: "Reception", note: "Dinner, blessings and celebration.",            date: "", time: "", venue: "", mapUrl: "" }
  ],

  /* ---------- RSVP (button is hidden while whatsapp is "") ----------
     whatsapp: country code + number, digits only, e.g. "919876543210" */
  rsvp: { whatsapp: "", contactName: "" },

  /* ---------- Photos ---------- */
  heroPhotos:   ["9018", "9001", "9020"],
  invitePhoto:  "9014",
  // photo behind the quote / the closing note: tall one for phones, wide one for laptops
  quotePhoto:   { tall: "9006", wide: "9003" },
  closingPhoto: { tall: "8859", wide: "9021" },
  // landscape photos (so the gallery can give them a wide tile)
  widePhotos:   ["9003", "9004", "9021"],

  gallery: [
    { title: "Whispers of the Woods",  layout: "coverflow",
      photos: ["8856", "8842", "8843", "8845", "8846", "8847", "8851", "8855", "8858", "8849", "8860"] },
    { title: "Golden Hour by the Sea", layout: "ribbon",
      photos: ["8993", "8999", "9005", "9010", "9012", "8994", "9002", "9007", "9011", "8996"] },
    { title: "Rooted in Tradition",    layout: "grid",
      photos: ["9015", "9016", "9017", "9019", "9021", "9022", "9023"] }
  ],

  /* ---------- Films (add more rows for more videos) ---------- */
  films: [
    { title:  "Our Pre-Wedding Film",
      src:    "assets/video/film.mp4",
      teaser: "assets/video/teaser.mp4",    // short silent loop shown before play ("" to skip)
      poster: "assets/video/poster.webp" }
  ],

  /* ---------- Background music (optional) ----------
     Put an .mp3 you have the rights to in assets/ and set e.g. "assets/music.mp3".
     A music button appears only when this is filled in.               */
  music: ""
};
