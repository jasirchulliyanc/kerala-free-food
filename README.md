# Free Food Kerala

A community list of places giving free food in Kerala. Anyone can submit a place; an admin approves it before it shows on the site.

- Public site: `/` — browse, filter by district and type, search, and submit new places
- Admin: `/admin` — log in with the admin password, approve, reject, edit, unpublish or delete listings

## Run locally

```bash
npm install
ADMIN_PASSWORD=choose-a-strong-one npm start
# open http://localhost:3000
```

Requires Node 22.13+ (uses the built-in `node:sqlite`, so there are no native dependencies).

## Environment variables

| Name | Required | Purpose |
|---|---|---|
| `ADMIN_PASSWORD` | yes | Password for `/admin` |
| `SESSION_SECRET` | recommended | Random string used to sign admin login cookies |
| `DB_PATH` | on Railway | Where the SQLite file lives, e.g. `/data/food.db` on a mounted volume |
| `PORT` | no | Set automatically by Railway |

## Deploy on Railway

1. Push this repo to GitHub and create a Railway service from it.
2. Add a volume mounted at `/data` and set `DB_PATH=/data/food.db`, so listings survive redeploys.
3. Set `ADMIN_PASSWORD` and `SESSION_SECRET`.
4. Generate a domain, or attach your own (e.g. `keralafreefood.eu.org`) with a CNAME record.

## Spam protection

Hidden honeypot field, 5 submissions per IP per hour, a cap on the pending queue, and admin login limited to 10 attempts per 15 minutes.
