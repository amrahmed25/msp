Portfolio link/contact fixes — partial delivery

Files included:
- helpers.js: prevents common relative app paths such as index.html and /dashboard from being normalized into external URLs; bare non-domain values are rejected.
- parts.js: shared contact form now validates name/email/message, checks the portfolio owner's configured email, and opens a prefilled Gmail compose URL in the current tab. Recipient comes from m.email; subject/body are URL-encoded; the visitor's email is included in the body.

Validation performed:
- Node syntax checks passed for helpers.js, parts.js, and the three supplied template modules.
- Smoke tests passed for the three supplied templates (Creative, Developer, Freelancer): expected section IDs, Gmail form handler, and distinct project demo/GitHub URLs.

Not complete / needs project files:
- reference.js was not uploaded.
- runtime.js and portfolio-renderer.js were not uploaded. Those may intercept/rewrite navigation or handle form submission, so the inline form handler should be integrated with/checked against the real runtime before treating this as production-verified.
- No browser-based end-to-end tests were possible from the supplied files alone.
