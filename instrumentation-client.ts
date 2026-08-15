import posthog from "posthog-js";

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

// Telemetry is opt-in, not required: this repo gets cloned and run by people
// who won't have Eshaan's PostHog project configured, and that must never
// break `npm run dev` for them — so this stays silent rather than throwing.
if (!projectToken || !host) {
  if (process.env.NODE_ENV === "development") {
    console.info(
      "PostHog not configured (NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN/NEXT_PUBLIC_POSTHOG_HOST) - telemetry disabled, everything else works fine."
    );
  }
} else {
  posthog.init(projectToken, {
    api_host: host,
    defaults: "2026-01-30",
    capture_exceptions: {
      capture_unhandled_errors: true,
      capture_unhandled_rejections: true,
      capture_console_errors: false,
    },
    debug: process.env.NODE_ENV === "development",
  });
}
