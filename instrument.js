import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: "https://d386905c0c46b64814dba80f16b49e51@o4508110398095360.ingest.us.sentry.io/4508505052282880",
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0,
});
