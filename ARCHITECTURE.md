# TΞKΗ+ — Architecture

> Feature-based, scalable frontend architecture.

## Directory Structure

```
src/
├── main.tsx                    # Entry point
├── app/                        # App shell
│   ├── App.tsx                 # Root component, routing, providers
│   ├── App.css                 # App-level styles
│   └── index.css               # Global CSS tokens & resets
│
├── core/                       # Singleton services (no UI)
│   ├── api/                    # All API & data access
│   │   ├── supabaseClient.ts   # Supabase initialisation
│   │   ├── supabaseApi.ts      # Supabase queries (brands, models, deals, auth)
│   │   ├── main_api.ts         # REST API helpers (getProduits, etc.)
│   │   ├── api.ts              # Generic fetch wrapper
│   │   ├── auth.ts             # Token management (getToken, setSession)
│   │   ├── pricing.ts          # Pricing engine (Charte TEKH+ v1.0)
│   │   └── endpoints.ts        # API endpoint constants
│   ├── config/
│   │   └── i18n.ts             # i18next configuration (fr/en)
│   └── theme/
│       └── ThemeProvider.tsx    # Dark/light theme context
│
├── shared/                     # Reusable, feature-agnostic code
│   ├── ui/                     # shadcn/ui primitives (button, card, dialog…)
│   ├── components/             # Layout & navigation
│   │   ├── Layout.tsx          # Page shell (Navbar + content + Footer)
│   │   ├── Navbar.tsx          # Top navigation bar
│   │   ├── BottomNav.tsx       # Mobile bottom tab bar
│   │   ├── Sidebar.tsx         # Desktop sidebar
│   │   ├── Footer.tsx          # Site footer
│   │   ├── ScrollToTop.tsx     # Scroll restoration (native-level)
│   │   └── PageLoader.tsx      # Suspense fallback skeleton
│   ├── hooks/                  # Custom hooks (use-mobile, use-toast)
│   ├── data/                   # Static/mock data (dealsData, phoneValueData)
│   ├── types/                  # Shared TypeScript types
│   └── utils/                  # Utility functions
│
├── features/                   # Domain modules (self-contained)
│   ├── home/                   # Landing page sections
│   ├── marketplace/            # Deals listing, publishing, search
│   ├── simulator/              # Trade-in estimator & diagnostic
│   ├── auth/                   # Login, registration, protected routes
│   ├── admin/                  # Admin dashboard (layout + pages)
│   ├── chatbot/                # TekhBot assistant
│   ├── profile/                # User profile
│   ├── settings/               # App settings
│   ├── blog/                   # Blog/news
│   ├── legal/                  # CGU, CGV, privacy, charters
│   ├── apk/                    # APK download page
│   └── misc/                   # 404, admin gateway
│
└── assets/                     # Static files (icons, illustrations, locales)
```

## Path Aliases

| Alias | Resolves to | Usage |
|-------|-------------|-------|
| `@/*` | `src/*` | Universal fallback |
| `@core/*` | `src/core/*` | API, config, theme |
| `@features/*` | `src/features/*` | Feature modules |
| `@shared/*` | `src/shared/*` | UI, components, hooks |
| `@app/*` | `src/app/*` | App shell |

Configured in both `tsconfig.app.json` and `vite.config.ts`.

## Import Rules

1. **`@core`** → imports from `node_modules` and itself only
2. **`@shared`** → imports from `@core` and `node_modules`
3. **`@features/*`** → imports from `@core`, `@shared`, and its own directory
4. **Never** import from one feature into another — use `@shared` or `@core` as intermediary
5. **`@app`** → imports from everywhere (it's the composition root)

## Key Design Decisions

- **Feature renamed**: `deals` → `marketplace` for clarity and to avoid naming collisions
- **Mock data centralized**: Moved to `@shared/data` so multiple features can share it
- **Scroll restoration**: Uses `useNavigationType()` + `history.scrollRestoration = 'manual'` for native-level back-navigation
- **Splash screen**: Minimalist logo-only, 0.6s fade-in, pure black background
- **PWA manifest**: Separate `any` and `maskable` icon entries for correct adaptive icon rendering
