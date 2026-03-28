import * as Sentry from "@sentry/react";

const DSN = (import.meta.env.VITE_SENTRY_DSN as string | undefined)?.trim();

export function initSentry() {
  if (!DSN) return; // Sentry désactivé si DSN absent (local sans .env)

  Sentry.init({
    dsn: DSN,
    environment: import.meta.env.MODE, // "development" | "production"
    release: import.meta.env.VITE_APP_VERSION as string | undefined,

    // Capture 10% des transactions en prod pour la performance
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

    // Replay : 1% des sessions normales, 100% des sessions avec erreur
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // Ne pas logguer les erreurs de chargement du service worker (non fatales)
    ignoreErrors: [
      "ResizeObserver loop",
      "Non-Error exception captured",
      /ServiceWorker/i,
    ],
  });
}
