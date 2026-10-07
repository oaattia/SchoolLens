# Hosting SchoolLens on Proxmox (Docker in an LXC container)

This guide deploys SchoolLens as a Docker container inside a Proxmox LXC container, serving HTTP on a port. You can add a domain + HTTPS later.

> **Why LXC + Docker?** LXC is lighter than a full VM, and Docker keeps the app reproducible. This is the recommended path on Proxmox for a single small web app.

---

## Prerequisites

- A running Proxmox VE host (7.x or 8.x) with web access
- The SchoolLens project files (this repo) available to copy to the container
- ~1 GB free RAM, ~5 GB free disk for the LXC

## What gets built

```
Proxmox host
└── LXC container (Debian 12)
    └── Docker
        └── schoollens container (Next.js standalone + Prisma + SQLite)
            └── /app/data/dev.db  (persistent volume)
```

The SQLite database lives on a Docker named volume, so your comments survive container rebuilds and image updates.

---

## Step 1 — Create a Debian LXC on Proxmox

In the Proxmox web UI:

1. **Create CT** (top right).
2. **General** — give it a hostname like `schoollens`, set a password, note the CTID.
3. **Template** — download and pick **Debian 12 (bookworm)**.
4. **Disks** — 8 GB is plenty.
5. **CPU** — 1 core is enough for the MVP.
6. **Memory** — 1024 MB (2048 MB if you have room).
7. **Network** — DHCP or a static IP on your LAN. Note the IP.
8. **DNS** — leave defaults.
9. **Confirm** and create. **Start** the container.

> Tip: create the LXC as **unprivileged** (the default). Docker runs fine inside it on Proxmox 7+/8 with the settings below.

## Step 2 — Enable Docker inside the LXC

Docker needs a few of features that Proxmox disables in unprivileged containers by default. In the Proxmox web UI, open the LXC's **Options → Features** and enable **keyctl** and **nesting=1**. (If "Features" isn't visible, see the manual method below.)

Then open the LXC's console (or SSH to its IP) and run:

```bash
apt-get update && apt-get upgrade -y
apt-get install -y curl ca-certificates

# Install Docker Engine + Compose plugin
curl -fsSL https://get.docker.com | sh
docker --version
docker compose version
```

Confirm both commands print versions before continuing.

<details>
<summary>Manual <code>features</code> method (if the UI toggle is missing)</summary>

On the Proxmox **host** (not the LXC), edit `/etc/pve/lxc/<CTID>.conf` and add:

```
features: keyctl=1,nesting=1
```

Then restart the LXC: `pct restart <CTID>` (on the host).
</details>

## Step 3 — Get the project files into the LXC

Pick whichever is easiest:

**Option A — git clone (if the repo is on GitHub):**
```bash
apt-get install -y git
git clone https://github.com/<you>/SchoolLens.git
cd SchoolLens
```

**Option B — copy from your machine with scp:**
```bash
# from your local machine, replace <lxc-ip> and <ct-user>
scp -r /Users/oaattia/Code/SchoolLens <ct-user>@<lxc-ip>:~/SchoolLens
```

**Option C — rsync (skips node_modules for speed):**
```bash
rsync -av --exclude node_modules --exclude .next --exclude prisma/dev.db \
  /Users/oaattia/Code/SchoolLens/ <ct-user>@<lxc-ip>:~/SchoolLens/
```

## Step 4 — Configure the API key

Generate a real key (don't ship the dev default in production):

```bash
cd ~/SchoolLens
openssl rand -hex 32
```

Create a `.env` file in the project dir (this is read by docker-compose):

```bash
cat > .env <<EOF
SCHOOLLENS_INTERNAL_API_KEY=<paste the key from openssl above>
EOF
chmod 600 .env
```

## Step 5 — Build and run

```bash
cd ~/SchoolLens
docker compose up -d --build
```

First build takes a few minutes (downloads Node, installs deps, builds Next.js). When it finishes:

```bash
# check it's running
docker compose ps
docker compose logs -f --tail=50
```

You should see logs ending with `▶ Starting SchoolLens on :3000 ...`.

## Step 6 — Open it

From the LXC:

```bash
curl -s http://localhost:3000/ | head -5
```

From another machine on your LAN, open in a browser:

```
http://<lxc-ip>:3000
```

You should see the SchoolLens homepage with the three seeded schools.

If you'd rather serve on port 80, edit `docker-compose.yml`:

```yaml
ports:
  - "80:3000"
```

then `docker compose up -d`.

## Step 7 — Test the Hermes ingest endpoint

From anywhere that can reach the LXC IP:

```bash
curl -X POST http://<lxc-ip>:3000/api/internal/comments \
  -H "Content-Type: application/json" \
  -H "x-api-key: <the key you generated>" \
  -d '{
    "source": "facebook",
    "external_id": "test_1",
    "school": "Metropolitan School Cairo",
    "comment": "تجربة الإنتاج",
    "topic": "english",
    "sentiment": "positive",
    "date": "2026-10-07"
  }'
# → {"ok":true,"id":"...","schoolId":"...","created":true}
```

---

## Day-to-day operations

| Task | Command |
|---|---|
| View logs | `docker compose logs -f --tail=100` |
| Restart | `docker compose restart` |
| Stop | `docker compose down` |
| Rebuild after code changes | `docker compose up -d --build` |
| Inspect the DB | `docker compose exec schoollens npx prisma studio` (then forward port 5555) |
| Back up the DB | `docker compose exec schoollens cat /app/data/dev.db > backup-$(date +%F).db` |
| Restore the DB | copy a backup file to `./data/dev.db` on the volume, then `docker compose restart` |

**Updating the app** after you change code:

```bash
git pull            # or rsync the new files
docker compose up -d --build
```

The database volume (`schoollens-data`) is **not** touched by rebuilds, so comments persist.

## Security checklist (before you expose this publicly)

- [ ] Replace `SCHOOLLENS_INTERNAL_API_KEY` with a real `openssl rand -hex 32` value (Step 4).
- [ ] Put the LXC behind a firewall — only expose the port you need (3000/80) to the internet, keep SSH on the LAN.
- [ ] Add a reverse proxy with HTTPS when you have a domain (see below).
- [ ] Rate-limit the `/api/internal/comments` endpoint (a WAF like Cloudflare in front is the cheapest win).
- [ ] Back up the `schoollens-data` volume regularly.

---

## Adding a domain + HTTPS later (with Caddy)

When you have a domain pointing at your Proxmox host's public IP, the simplest HTTPS setup is Caddy (automatic Let's Encrypt). Add this to `docker-compose.yml`:

```yaml
services:
  schoollens:
    # ... existing config, but remove the `ports:` section ...
    networks: [internal]

  caddy:
    image: caddy:2
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy-data:/data
      - caddy-config:/config
    networks: [internal]

networks:
  internal:

volumes:
  schoollens-data:
  caddy-data:
  caddy-config:
```

Create a `Caddyfile` next to `docker-compose.yml`:

```
schoollens.yourdomain.com {
  reverse_proxy schoollens:3000
}
```

Then `docker compose up -d --build`. Caddy fetches and renews the certificate automatically.

---

## Troubleshooting

**`docker compose up` fails with "cannot start container" / OCI errors**
→ The LXC is missing nesting/keyctl. Re-check Step 2 — enable `keyctl=1,nesting=1` in Proxmox **Options → Features**, then `pct restart <CTID>` from the host.

**Prisma error about `libssl` / `libcrypto`**
→ The Dockerfile installs `openssl` and `ca-certificates`; if you customized it, make sure those are still installed in the runner stage.

**Port 3000 already in use on the host**
→ Change the left side of the `ports:` mapping in `docker-compose.yml` (e.g. `"8080:3000"`).

**App starts but shows "no schools"**
→ The seed runs only on first run (when the DB has zero schools). To force a re-seed: `docker compose down`, delete the volume (`docker volume rm schoollens_schoollens-data`), and `docker compose up -d --build`.

**`curl /api/internal/comments` returns 401**
→ You're not sending `x-api-key`, or the value doesn't match the `SCHOOLLENS_INTERNAL_API_KEY` in the container's env. Check with `docker compose exec schoollens printenv SCHOOLLENS_INTERNAL_API_KEY`.

**Want to run Prisma Studio against the live DB**
```bash
docker compose exec schoollens sh -c "DATABASE_URL=file:/app/data/dev.db npx prisma studio"
# then forward port 5555 from the LXC to your machine:
#   ssh -L 5555:localhost:5555 <ct-user>@<lxc-ip>
```