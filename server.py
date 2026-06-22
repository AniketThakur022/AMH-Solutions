"""
AMH Solutions — backend
=======================
Flask + SQLite. One file. Self-hostable.

Runs the static marketing site AND a dynamic admin/client app:
- Public:  /index.html, /portfolio.html, /services.html, /about.html, /contact.html
- Admin:   /admin/login, /admin/dashboard, /api/admin/...
- Client:  /client/login, /client/dashboard, /api/client/...

First run seeds an admin user (admin@amhsolutions.com / changeme) and the
current static content so the public pages look identical to before.

Start with:  python3 server.py
"""
from __future__ import annotations

import os
import sqlite3
import secrets
from datetime import datetime
from functools import wraps
from pathlib import Path

from flask import (
    Flask, request, session, redirect, jsonify,
    send_from_directory, render_template_string, abort, url_for
)
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

ROOT = Path(__file__).parent.resolve()
DB_PATH = ROOT / "amh.db"
UPLOAD_DIR = ROOT / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXT = {"png", "jpg", "jpeg", "gif", "webp", "svg"}
MAX_UPLOAD_MB = 10

# ────────────────────────────────────────────────────────────────────────────
# App setup
# ────────────────────────────────────────────────────────────────────────────
app = Flask(__name__, static_folder=str(ROOT), static_url_path="")
app.secret_key = os.environ.get("AMH_SECRET", "dev-secret-change-me-" + secrets.token_hex(8))
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_MB * 1024 * 1024


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


# ────────────────────────────────────────────────────────────────────────────
# Schema + seed
# ────────────────────────────────────────────────────────────────────────────
SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin','client')),
  full_name TEXT,
  company_name TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS brands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  domain TEXT,
  monogram TEXT,
  color TEXT DEFAULT '#3B82F6',
  link TEXT,
  display_order INTEGER DEFAULT 0,
  is_featured INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  icon_svg TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolio_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  url TEXT,
  category TEXT,
  tags TEXT,
  description TEXT,
  image_path TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK(status IN ('planning','in_progress','review','completed','paused')),
  progress_percent INTEGER DEFAULT 0,
  start_date TEXT,
  expected_end_date TEXT,
  completed_date TEXT,
  cover_image TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_updates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  body TEXT,
  posted_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  filepath TEXT NOT NULL,
  uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
"""

SEED_BRANDS = [
    # (name, domain, monogram, color, link, featured)
    ("Easy Travel", "easytravel.co.tz", "ET", "#F59E0B", "https://www.easytravel.co.tz/", 1),
    ("Pet Shop in Pune", "petshopinpune.com", "PP", "#EA580C", "https://petshopinpune.com/", 1),
    ("Get Nothin", "get-nothin.com", "GN", "#0F172A", "https://get-nothin.com/", 1),
    ("Devanta Exports", "devantaexports.com", "DE", "#B45309", "https://devantaexports.com/", 1),
    ("Mahaganpati Gold", "mahaganpatigoldbuyers.com", "M", "#F59E0B", "https://www.instagram.com/mahaganpati_gold_buyers", 1),

]

SEED_SERVICES = [
    ("Full-Stack Web Development", "Production-grade websites and web apps built on modern stacks — React, Next.js, Node, Python — with clean APIs and scalable infra.", 1),
    ("Custom Software", "Tailored software built around your workflow — internal tools, dashboards, automations and integrations that make teams faster.", 2),
    ("Technical Solutions", "Architecture, code reviews, performance audits and migrations — we step in when something needs to be fixed, fast and properly.", 3),
    ("Complete IT Solutions", "Domains, hosting, email, security, CRMs and back-office tooling — one partner for every piece of your IT stack.", 4),
    ("Social Media Handling", "Strategy, content, scheduling and reporting — we keep your social presence consistent, on-brand and growing every month.", 5),
    ("Logo & Brand Identity", "Distinctive logos, type systems and brand guidelines that make your business instantly recognisable across every surface.", 6),
    ("Packaging & Labelling Design", "Shelf-ready packaging and label systems — designed for print, optimised for shelf impact, and built for export-grade compliance.", 7),
    ("SEO & Organic Growth", "Technical SEO, on-page optimisation, schema and local SEO — traffic that compounds long after the ads turn off.", 8),
]

SEED_PORTFOLIO = [
    # (title, url, category, tags, description, image_path)
    ("Easy Travel", "https://www.easytravel.co.tz/", "Travel · Tourism", "Web Development,Travel · Tourism",
     "A premium safari & tourism platform for one of Tanzania's leading travel brands — built for discovery, designed for trust.",
     "https://image.thum.io/get/width/1200/crop/800/https://www.easytravel.co.tz/"),
    ("Pet Shop in Pune", "https://petshopinpune.com/", "E-commerce · Pets", "E-commerce,D2C · Pets",
     "A full e-commerce store for one of Pune's largest pet supply businesses — product catalogue, ordering and home delivery built end-to-end.",
     "https://image.thum.io/get/width/1200/crop/800/https://petshopinpune.com/"),
    ("Get Nothin", "https://get-nothin.com/", "D2C Brand · Lifestyle", "D2C Brand,Lifestyle · Retail",
     "A clean, modern storefront for a homegrown lifestyle label — built to convert browsers into buyers with a confident, minimal aesthetic.",
     "https://image.thum.io/get/width/1200/crop/800/https://get-nothin.com/"),
    ("Devanta Exports", "https://devantaexports.com/", "Export · Trade", "Export · Trade,Natural Stone",
     "A premium marketing site for a global natural-stone exporter — animated hero, product catalogue, and buyer-grade compliance.",
     "https://image.thum.io/get/width/1200/crop/800/https://devantaexports.com/"),
]


def init_db():
    """Create tables and seed if empty."""
    with get_db() as conn:
        conn.executescript(SCHEMA)

        # Admin user
        if not conn.execute("SELECT 1 FROM users WHERE role='admin' LIMIT 1").fetchone():
            conn.execute(
                "INSERT INTO users (email, password_hash, role, full_name) VALUES (?,?,?,?)",
                ("admin@amhsolutions.com",
                 generate_password_hash("changeme"),
                 "admin",
                 "AMH Solutions Admin"),
            )

        # Demo client account so the user can preview the client experience
        if not conn.execute("SELECT 1 FROM users WHERE email='demo@client.com'").fetchone():
            cur = conn.execute(
                "INSERT INTO users (email, password_hash, role, full_name, company_name) VALUES (?,?,?,?,?)",
                ("demo@client.com",
                 generate_password_hash("demo1234"),
                 "client",
                 "Demo Client",
                 "Demo Client Pvt Ltd"),
            )
            demo_client_id = cur.lastrowid

            # Seed two example projects for the demo client
            today = datetime.utcnow().date().isoformat()
            conn.execute(
                """INSERT INTO projects (client_id, title, description, status, progress_percent,
                   start_date, expected_end_date, notes)
                   VALUES (?,?,?,?,?,?,?,?)""",
                (demo_client_id,
                 "Website redesign",
                 "Full marketing-site rebuild with new design system, blog and CRM integration.",
                 "in_progress", 65,
                 "2026-04-01", "2026-06-15",
                 "Hero + services + portfolio shipped. Blog template in review.")
            )
            conn.execute(
                """INSERT INTO projects (client_id, title, description, status, progress_percent,
                   start_date, completed_date, notes)
                   VALUES (?,?,?,?,?,?,?,?)""",
                (demo_client_id,
                 "Logo & brand system",
                 "Primary logo, monogram, brand colours, type scale and packaging guide.",
                 "completed", 100,
                 "2026-02-01", "2026-03-12",
                 "Delivered final brand-guide PDF.")
            )

        # Brands
        if not conn.execute("SELECT 1 FROM brands LIMIT 1").fetchone():
            for i, (name, domain, mono, color, link, featured) in enumerate(SEED_BRANDS):
                conn.execute(
                    """INSERT INTO brands (name, domain, monogram, color, link, display_order, is_featured)
                       VALUES (?,?,?,?,?,?,?)""",
                    (name, domain, mono, color, link, i, featured),
                )

        # Services
        if not conn.execute("SELECT 1 FROM services LIMIT 1").fetchone():
            for title, desc, order in SEED_SERVICES:
                conn.execute(
                    "INSERT INTO services (title, description, display_order) VALUES (?,?,?)",
                    (title, desc, order),
                )

        # Portfolio
        if not conn.execute("SELECT 1 FROM portfolio_items LIMIT 1").fetchone():
            for i, (title, url, cat, tags, desc, img) in enumerate(SEED_PORTFOLIO):
                conn.execute(
                    """INSERT INTO portfolio_items
                       (title, url, category, tags, description, image_path, display_order)
                       VALUES (?,?,?,?,?,?,?)""",
                    (title, url, cat, tags, desc, img, i),
                )

        conn.commit()


# ────────────────────────────────────────────────────────────────────────────
# Auth helpers
# ────────────────────────────────────────────────────────────────────────────
def current_user():
    uid = session.get("user_id")
    if not uid:
        return None
    with get_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
    return dict(row) if row else None


def login_required(role: str | None = None):
    def deco(fn):
        @wraps(fn)
        def wrapper(*a, **kw):
            user = current_user()
            if not user:
                # API requests get JSON 401, page requests get redirect
                if request.path.startswith("/api/"):
                    return jsonify({"error": "unauthenticated"}), 401
                login_url = "/admin/login" if role == "admin" else "/client/login"
                return redirect(login_url)
            if role and user["role"] != role:
                if request.path.startswith("/api/"):
                    return jsonify({"error": "forbidden"}), 403
                return redirect("/")
            request.user = user
            return fn(*a, **kw)
        return wrapper
    return deco


# ────────────────────────────────────────────────────────────────────────────
# Public static pages — Flask's default static handler serves /*.html
# ────────────────────────────────────────────────────────────────────────────
@app.route("/")
def root():
    return send_from_directory(str(ROOT), "index.html")


@app.route("/uploads/<path:filename>")
def serve_upload(filename):
    return send_from_directory(str(UPLOAD_DIR), filename)


# ────────────────────────────────────────────────────────────────────────────
# Public API — used by the marketing pages
# ────────────────────────────────────────────────────────────────────────────
@app.route("/api/brands")
def api_brands():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, name, domain, monogram, color, link, is_featured "
            "FROM brands WHERE is_active=1 ORDER BY display_order, id"
        ).fetchall()
    return jsonify([dict(r) for r in rows])


@app.route("/api/services")
def api_services():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, title, description, icon_svg, display_order "
            "FROM services WHERE is_active=1 ORDER BY display_order, id"
        ).fetchall()
    return jsonify([dict(r) for r in rows])


@app.route("/api/portfolio")
def api_portfolio():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, title, url, category, tags, description, image_path "
            "FROM portfolio_items WHERE is_active=1 ORDER BY display_order, id"
        ).fetchall()
    items = []
    for r in rows:
        d = dict(r)
        d["tags"] = d["tags"].split(",") if d.get("tags") else []
        items.append(d)
    return jsonify(items)


# ────────────────────────────────────────────────────────────────────────────
# Auth routes
# ────────────────────────────────────────────────────────────────────────────
def do_login(role: str):
    if request.method == "GET":
        return send_from_directory(str(ROOT / role), "login.html")

    email = (request.form.get("email") or "").strip().lower()
    pw = request.form.get("password") or ""
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE email=? AND role=?", (email, role)
        ).fetchone()

    if not row or not check_password_hash(row["password_hash"], pw):
        return jsonify({"error": "Invalid credentials"}), 401

    session.clear()
    session["user_id"] = row["id"]
    session["role"] = row["role"]
    return jsonify({"ok": True, "redirect": f"/{role}/dashboard.html"})


@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    return do_login("admin")


@app.route("/client/login", methods=["GET", "POST"])
def client_login():
    return do_login("client")


@app.route("/logout", methods=["GET", "POST"])
def logout():
    session.clear()
    return redirect("/")


@app.route("/admin/dashboard.html")
@login_required(role="admin")
def admin_dashboard_page():
    return send_from_directory(str(ROOT / "admin"), "dashboard.html")


@app.route("/client/dashboard.html")
@login_required(role="client")
def client_dashboard_page():
    return send_from_directory(str(ROOT / "client"), "dashboard.html")


@app.route("/api/me")
def api_me():
    u = current_user()
    if not u:
        return jsonify({"authenticated": False})
    return jsonify({
        "authenticated": True,
        "id": u["id"], "email": u["email"], "role": u["role"],
        "full_name": u.get("full_name"), "company_name": u.get("company_name"),
    })


# ────────────────────────────────────────────────────────────────────────────
# Image upload (admin only)
# ────────────────────────────────────────────────────────────────────────────
@app.route("/api/admin/upload", methods=["POST"])
@login_required(role="admin")
def upload_image():
    if "file" not in request.files:
        return jsonify({"error": "no file"}), 400
    f = request.files["file"]
    if not f.filename:
        return jsonify({"error": "empty filename"}), 400
    ext = f.filename.rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXT:
        return jsonify({"error": f"extension .{ext} not allowed"}), 400

    safe = secure_filename(f.filename)
    ts = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
    final_name = f"{ts}-{secrets.token_hex(4)}-{safe}"
    f.save(UPLOAD_DIR / final_name)
    return jsonify({"url": f"/uploads/{final_name}"})


# ────────────────────────────────────────────────────────────────────────────
# Admin CRUD — brands
# ────────────────────────────────────────────────────────────────────────────
@app.route("/api/admin/brands", methods=["GET", "POST"])
@login_required(role="admin")
def admin_brands():
    if request.method == "GET":
        with get_db() as conn:
            rows = conn.execute(
                "SELECT * FROM brands ORDER BY display_order, id"
            ).fetchall()
        return jsonify([dict(r) for r in rows])

    j = request.json or {}
    with get_db() as conn:
        cur = conn.execute(
            """INSERT INTO brands (name, domain, monogram, color, link, display_order, is_featured, is_active)
               VALUES (?,?,?,?,?,?,?,?)""",
            (j.get("name"), j.get("domain"), j.get("monogram"),
             j.get("color", "#3B82F6"), j.get("link"),
             j.get("display_order", 999),
             1 if j.get("is_featured") else 0,
             1 if j.get("is_active", True) else 0),
        )
        conn.commit()
        return jsonify({"id": cur.lastrowid}), 201


@app.route("/api/admin/brands/<int:bid>", methods=["PUT", "DELETE"])
@login_required(role="admin")
def admin_brand_detail(bid):
    with get_db() as conn:
        if request.method == "DELETE":
            conn.execute("DELETE FROM brands WHERE id=?", (bid,))
            conn.commit()
            return jsonify({"ok": True})
        j = request.json or {}
        fields = ["name", "domain", "monogram", "color", "link", "display_order", "is_featured", "is_active"]
        sets, vals = [], []
        for f in fields:
            if f in j:
                sets.append(f"{f}=?")
                v = j[f]
                if f in ("is_featured", "is_active"):
                    v = 1 if v else 0
                vals.append(v)
        if not sets:
            return jsonify({"error": "no fields"}), 400
        vals.append(bid)
        conn.execute(f"UPDATE brands SET {','.join(sets)} WHERE id=?", vals)
        conn.commit()
    return jsonify({"ok": True})


# ────────────────────────────────────────────────────────────────────────────
# Admin CRUD — services
# ────────────────────────────────────────────────────────────────────────────
@app.route("/api/admin/services", methods=["GET", "POST"])
@login_required(role="admin")
def admin_services():
    if request.method == "GET":
        with get_db() as conn:
            rows = conn.execute("SELECT * FROM services ORDER BY display_order, id").fetchall()
        return jsonify([dict(r) for r in rows])
    j = request.json or {}
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO services (title, description, icon_svg, display_order, is_active) VALUES (?,?,?,?,?)",
            (j.get("title"), j.get("description"), j.get("icon_svg"),
             j.get("display_order", 999),
             1 if j.get("is_active", True) else 0),
        )
        conn.commit()
        return jsonify({"id": cur.lastrowid}), 201


@app.route("/api/admin/services/<int:sid>", methods=["PUT", "DELETE"])
@login_required(role="admin")
def admin_service_detail(sid):
    with get_db() as conn:
        if request.method == "DELETE":
            conn.execute("DELETE FROM services WHERE id=?", (sid,))
            conn.commit()
            return jsonify({"ok": True})
        j = request.json or {}
        fields = ["title", "description", "icon_svg", "display_order", "is_active"]
        sets, vals = [], []
        for f in fields:
            if f in j:
                sets.append(f"{f}=?")
                v = j[f]
                if f == "is_active":
                    v = 1 if v else 0
                vals.append(v)
        if not sets:
            return jsonify({"error": "no fields"}), 400
        vals.append(sid)
        conn.execute(f"UPDATE services SET {','.join(sets)} WHERE id=?", vals)
        conn.commit()
    return jsonify({"ok": True})


# ────────────────────────────────────────────────────────────────────────────
# Admin CRUD — portfolio items
# ────────────────────────────────────────────────────────────────────────────
@app.route("/api/admin/portfolio", methods=["GET", "POST"])
@login_required(role="admin")
def admin_portfolio():
    if request.method == "GET":
        with get_db() as conn:
            rows = conn.execute("SELECT * FROM portfolio_items ORDER BY display_order, id").fetchall()
        return jsonify([dict(r) for r in rows])
    j = request.json or {}
    with get_db() as conn:
        cur = conn.execute(
            """INSERT INTO portfolio_items
               (title, url, category, tags, description, image_path, display_order, is_active)
               VALUES (?,?,?,?,?,?,?,?)""",
            (j.get("title"), j.get("url"), j.get("category"),
             j.get("tags"), j.get("description"), j.get("image_path"),
             j.get("display_order", 999),
             1 if j.get("is_active", True) else 0),
        )
        conn.commit()
        return jsonify({"id": cur.lastrowid}), 201


@app.route("/api/admin/portfolio/<int:pid>", methods=["PUT", "DELETE"])
@login_required(role="admin")
def admin_portfolio_detail(pid):
    with get_db() as conn:
        if request.method == "DELETE":
            conn.execute("DELETE FROM portfolio_items WHERE id=?", (pid,))
            conn.commit()
            return jsonify({"ok": True})
        j = request.json or {}
        fields = ["title", "url", "category", "tags", "description", "image_path", "display_order", "is_active"]
        sets, vals = [], []
        for f in fields:
            if f in j:
                sets.append(f"{f}=?")
                v = j[f]
                if f == "is_active":
                    v = 1 if v else 0
                vals.append(v)
        if not sets:
            return jsonify({"error": "no fields"}), 400
        vals.append(pid)
        conn.execute(f"UPDATE portfolio_items SET {','.join(sets)} WHERE id=?", vals)
        conn.commit()
    return jsonify({"ok": True})


# ────────────────────────────────────────────────────────────────────────────
# Admin: clients + projects
# ────────────────────────────────────────────────────────────────────────────
@app.route("/api/admin/clients", methods=["GET", "POST"])
@login_required(role="admin")
def admin_clients():
    if request.method == "GET":
        with get_db() as conn:
            rows = conn.execute(
                "SELECT id, email, full_name, company_name, created_at FROM users WHERE role='client' ORDER BY id DESC"
            ).fetchall()
        return jsonify([dict(r) for r in rows])

    j = request.json or {}
    email = (j.get("email") or "").strip().lower()
    pw = j.get("password") or secrets.token_urlsafe(10)
    if not email:
        return jsonify({"error": "email required"}), 400
    with get_db() as conn:
        try:
            cur = conn.execute(
                "INSERT INTO users (email, password_hash, role, full_name, company_name) VALUES (?,?,?,?,?)",
                (email, generate_password_hash(pw), "client",
                 j.get("full_name"), j.get("company_name")),
            )
            conn.commit()
        except sqlite3.IntegrityError:
            return jsonify({"error": "email already exists"}), 409
    return jsonify({"id": cur.lastrowid, "email": email, "password": pw}), 201


@app.route("/api/admin/clients/<int:cid>", methods=["PUT", "DELETE"])
@login_required(role="admin")
def admin_client_detail(cid):
    with get_db() as conn:
        if request.method == "DELETE":
            conn.execute("DELETE FROM users WHERE id=? AND role='client'", (cid,))
            conn.commit()
            return jsonify({"ok": True})
        j = request.json or {}
        sets, vals = [], []
        if "full_name" in j: sets.append("full_name=?"); vals.append(j["full_name"])
        if "company_name" in j: sets.append("company_name=?"); vals.append(j["company_name"])
        if j.get("password"):
            sets.append("password_hash=?")
            vals.append(generate_password_hash(j["password"]))
        if not sets:
            return jsonify({"error": "no fields"}), 400
        vals.append(cid)
        conn.execute(f"UPDATE users SET {','.join(sets)} WHERE id=? AND role='client'", vals)
        conn.commit()
    return jsonify({"ok": True})


@app.route("/api/admin/projects", methods=["GET", "POST"])
@login_required(role="admin")
def admin_projects():
    if request.method == "GET":
        with get_db() as conn:
            rows = conn.execute(
                """SELECT p.*, u.email AS client_email, u.company_name AS client_company,
                          u.full_name AS client_name
                   FROM projects p JOIN users u ON u.id=p.client_id
                   ORDER BY p.updated_at DESC, p.id DESC"""
            ).fetchall()
        return jsonify([dict(r) for r in rows])

    j = request.json or {}
    if not j.get("client_id") or not j.get("title") or not j.get("status"):
        return jsonify({"error": "client_id, title, status required"}), 400
    with get_db() as conn:
        cur = conn.execute(
            """INSERT INTO projects (client_id, title, description, status, progress_percent,
               start_date, expected_end_date, completed_date, cover_image, notes)
               VALUES (?,?,?,?,?,?,?,?,?,?)""",
            (j["client_id"], j["title"], j.get("description"), j["status"],
             j.get("progress_percent", 0), j.get("start_date"),
             j.get("expected_end_date"), j.get("completed_date"),
             j.get("cover_image"), j.get("notes")),
        )
        conn.commit()
    return jsonify({"id": cur.lastrowid}), 201


@app.route("/api/admin/projects/<int:pid>", methods=["PUT", "DELETE"])
@login_required(role="admin")
def admin_project_detail(pid):
    with get_db() as conn:
        if request.method == "DELETE":
            conn.execute("DELETE FROM projects WHERE id=?", (pid,))
            conn.commit()
            return jsonify({"ok": True})
        j = request.json or {}
        fields = ["title", "description", "status", "progress_percent",
                  "start_date", "expected_end_date", "completed_date",
                  "cover_image", "notes"]
        sets, vals = [], []
        for f in fields:
            if f in j:
                sets.append(f"{f}=?")
                vals.append(j[f])
        if not sets:
            return jsonify({"error": "no fields"}), 400
        sets.append("updated_at=CURRENT_TIMESTAMP")
        vals.append(pid)
        conn.execute(f"UPDATE projects SET {','.join(sets)} WHERE id=?", vals)
        conn.commit()
    return jsonify({"ok": True})


# ────────────────────────────────────────────────────────────────────────────
# Client API — only their own projects
# ────────────────────────────────────────────────────────────────────────────
@app.route("/api/client/projects")
@login_required(role="client")
def client_projects():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM projects WHERE client_id=? ORDER BY status='completed', updated_at DESC",
            (request.user["id"],),
        ).fetchall()
    return jsonify([dict(r) for r in rows])


@app.route("/api/client/projects/<int:pid>")
@login_required(role="client")
def client_project_detail(pid):
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM projects WHERE id=? AND client_id=?",
            (pid, request.user["id"]),
        ).fetchone()
        if not row:
            return jsonify({"error": "not found"}), 404
        updates = conn.execute(
            "SELECT * FROM project_updates WHERE project_id=? ORDER BY posted_at DESC", (pid,)
        ).fetchall()
        files = conn.execute(
            "SELECT * FROM project_files WHERE project_id=? ORDER BY uploaded_at DESC", (pid,)
        ).fetchall()
    return jsonify({
        "project": dict(row),
        "updates": [dict(u) for u in updates],
        "files": [dict(f) for f in files],
    })


# ────────────────────────────────────────────────────────────────────────────
# Boot
# ────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    init_db()
    print(" * AMH Solutions server")
    print(" * DB:", DB_PATH)
    print(" * Uploads:", UPLOAD_DIR)
    print(" * Default admin: admin@amhsolutions.com / changeme  (please change!)")
    print(" * Demo client:  demo@client.com / demo1234")
    app.run(host="0.0.0.0", port=5850, debug=False)
