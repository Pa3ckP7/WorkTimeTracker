# Database Migrations

## Quick Start

1. Increment `DB_VERSION` in `db.ts`
2. Add SQL to `getMigrations()`
3. Done! Runs automatically on app start

---

## Option 1: Import from .sql file

**1. Create file:** `./migrations/<version>_<name>.sql`

**2. Add to migrations/index.ts:**

**3. Bump version in db.ts:**

---

## Tips

- Migrations run in order (1 → 2 → 3)
- Never skip version numbers
- Test by uninstalling/reinstalling app
- Reset DB: Uninstall app → Clear data → Reinstall
