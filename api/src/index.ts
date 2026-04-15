// Azure Functions (Node.js v4 programming model) entrypoint.
// Importing modules registers HTTP triggers via `app.http(...)`.
import "./functions/health.js";
import "./functions/generate.js";
import "./functions/history.js";
import "./functions/upload.js";
import "./functions/save.js";
import "./functions/contact.js";

