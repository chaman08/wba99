# Physiotherapy Case Assessment Platform

Premium React + Vite experience tailored for physiotherapists, expert reviewers, and admins. It feels modern, dark-mode first, and adaptable to Capacitor deployments.

## Highlights

- **Dark mode-first design system** with CSS variables, Tailwind theme extensions, subtle glass surfaces, and smooth micro-interactions inspired by Apple and Linear.
- **Role-based SaaS shell** – physiotherapist, expert reviewer, and admin routes are guarded by Zustand-powered auth with mocked credentials.
- **Mock data layer** persists `users`, `patients`, `cases`, and `reports` to `localStorage` so drafts survive reloads.
- **Media-forward workflows** for case creation (multi-step wizard, drag & drop slots, progress bars, auto-save) and reporting (observations, gait metrics, interpretation areas, and recommendation drafts).
- **Expert and admin panels** with dashboards, filters, assignments, and status timelines that keep teams aligned.
- **Theme toggle + persistence**, responsive layouts, and Tailwind utilities for a premium healthcare SaaS vibe.
## Tech stack

- React + Vite + TypeScript
- Tailwind CSS (via CLI) with CSS variables + gradient/glass styling
- Zustand for global store (auth, theme, data)
- React Router DOM for nested, guarded routes
- React Hook Form + Zod for validation
- React Dropzone for media uploads
- Lucide icons
- LocalStorage-powered mock services (no backend)

## Getting started

```bash
npm install
npm run dev        # start local dev server
npm run build      # production build (also verifies type checks)
npm run preview    # preview the build
```

## Credentials

Three demo users (password `demo`) unlock each workspace, and new accounts can be created via signup:

- `physio@demo.com` → physiotherapist shell
- `expert@demo.com` → expert reviewer shell
- `admin@demo.com` → admin workspace

Signup can create additional mock users/roles; each uses the password entered during signup and can sign in immediately afterward.

## Notable internals

- **Theme handling** lives in `src/lib/theme.ts`. Switching the toggle updates CSS variables, writes `wba99-theme`, and keeps dark mode as default.
- **Global state** lives in `src/store/useAppStore.ts` and wires auth, theme, users, patients, cases, reports, plus persistence via `src/services/mock-db.ts`.
- **Firebase bootstrap** lives in `src/lib/firebase.ts` so the provided Firebase config is ready for auth, Firestore, and storage services once you swap in real persistence.
- **Routing** is defined in `src/App.tsx` with protected nests for `/dashboard`, `/expert/*`, and `/admin/*`. `ProtectedRoute` renders `ProtectedShell` for elegant nav + theme toggle.
- **Wizard auto-save** keeps step data + media in `localStorage` (`case-wizard-draft`) and shows a “Saved just now” indicator.
- **Media UI** uses custom sections with drag & drop (React Dropzone), progress bars, remove/replace controls, and check icons for completion.

## Next steps

1. Hook real storage APIs (REST/GraphQL) when backend exists — adapt `services/mock-db.ts`.
2. Add animation polish (Framer Motion) for step transitions and toast notifications.
3. Layer in accessibility reviews (ARIA labeling, keyboard drag-and-drop enhancements).
