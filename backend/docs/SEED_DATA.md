# Seed Data & Demo Credentials

The backend seeds a fixed set of demo institutions, roles and users so the app is
usable immediately after a fresh database.

## How seeding runs

- **On server start** — `src/server.ts` calls `seedData()` when `env.seedOnStart` is true.
  It is **on by default outside production**; disable with `SEED_ON_START=false` in `.env`.
- **Manually** — `npm run seed` (`src/seed/run.ts`).

Seeding is **idempotent**: it only creates institutions, permissions, roles and users
that don't already exist (matched by slug / institution+name / email). Passwords are
only hashed when a user is actually created, so re-running is cheap.

To start completely fresh, drop the database, then run `npm run seed` (or just start
the server).

## Structure

- **2 institutions**: `institution-one`, `institution-two`
- **Permission catalog**: each institution gets the full `DEFAULT_PERMISSION_TEMPLATE` (12 keys)
- **4 roles per institution**:
  - **Institution Admin** — all 12 permission keys
  - **Librarian** — `book.view/create/update/delete`, `copy.manage`, `issue.create/return/view`, `user.view`
  - **Teacher** — `book.view`, `issue.view`
  - **Student** — `book.view`, `issue.view`

> Teacher and Student currently share the same permissions (browse catalog + view own
> loans via `/circulation/my`, which is open to any authenticated user). They are kept
> as separate roles so the Institution Admin can diverge them later in the UI.

## Credentials

Login is **email + password only** (email is globally unique; no institution code).
Emails are stored lowercased — login is case-insensitive.

### Platform super admins

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | `superadmin@elibraryOne.com` | `superADMIN@123test` |
| Admin (super admin) | `admin@elibraryOne.com` | `ADMIN@123test` |

> **Note:** `admin@elibraryOne.com` is seeded as a **second platform super admin**
> (the list didn't tie it to an institution). If it was meant to be something else,
> say so and I'll adjust the seed.

### Institution One (`institution-one`)

| Role | Email | Password |
| --- | --- | --- |
| Institution Admin | `institution1@elibraryOne.com` | `institution1@123test` |
| Librarian | `librarian1institution1@elibraryOne.com` | `librarian1institution1@123test` |
| Librarian | `librarian2institution1@elibraryOne.com` | `librarian2institution1@123test` |
| Teacher | `teacher1institution1@elibraryOne.com` | `teacher1institution1@123test` |
| Student | `student1institution1@elibraryOne.com` | `student1institution1@123test` |
| Student | `student2institution1@elibraryOne.com` | `student2institution1@123test` |

### Institution Two (`institution-two`)

| Role | Email | Password |
| --- | --- | --- |
| Institution Admin | `institution2@elibraryOne.com` | `institution2@123test` |
| Librarian | `librarian1institution2@elibraryOne.com` | `librarian1institution2@123test` |
| Teacher | `teacher1institution2@elibraryOne.com` | `teacher1institution2@123test` |
| Teacher | `teacher2institution2@elibraryOne.com` | `teacher2institution2@123test` |
| Student | `student1institution2@elibraryOne.com` | `student1institution2@123test` |
| Student | `student2institution2@elibraryOne.com` | `student2institution2@123test` |
| Student | `student3institution2@elibraryOne.com` | `student3institution2@123test` |
| Student | `student4institution2@elibraryOne.com` | `student4institution2@123test` |
