# Career Platform Engineering Guide

This file defines the standing engineering rules for humans and coding agents working in this repository.
Apply these rules to every task unless a more specific repository instruction or explicit user instruction safely overrides them.

## 1. Project Purpose

- Career Platform is intended to become a production-grade, scalable career SaaS platform.
- It serves candidates, employers, recruiters, and future AI-assisted career services.
- Existing production behavior, user data, security, and deployability take priority over rapid experimentation.
- Features must be suitable for real users, not merely demonstrations.

## 2. Repository Scope

- The repository root is `C:\career-platform`.
- The primary active full-stack application is `frontend/`.
- Run Next.js, npm, Prisma, TypeScript, and application build commands from `frontend/` unless a command explicitly targets another area.
- Top-level directories currently include `backend/`, `database/`, `shared/`, `agents/`, `ai/`, `doc/`, `docker/`, `scripts/`, and `test/`.
- Do not assume those other directories are active production applications unless current code and deployment configuration verify that fact.
- Limit changes to the task's requested scope.

## 3. Source of Truth

Use this precedence when determining current behavior:

1. Current repository code.
2. `frontend/prisma/schema.prisma` for database shape.
3. This `AGENTS.md` engineering guide.
4. Existing Prisma migrations.
5. Existing architectural conventions.
6. Task-specific user instructions.

- Explicit task instructions override roadmap order unless they are unsafe or conflict with higher-priority system constraints.
- If documentation conflicts with working code, inspect and report the discrepancy before changing behavior.
- Do not silently reinterpret existing product behavior based only on stale documentation.
- Verify assumptions from the repository whenever practical.

## 4. Core Engineering Principles

- MUST understand the affected flow before modifying it.
- MUST preserve working behavior outside the requested scope.
- SHOULD prefer small, focused changes over broad rewrites.
- MUST reuse existing abstractions when they fit.
- MUST avoid duplicate implementations.
- MUST favor production quality over quick hacks.
- MUST treat security and data integrity as mandatory requirements.
- Every feature MUST have a clear completion definition.
- MUST NOT hide errors with unsafe casts, broad suppression, or weakened checks.
- Prefer clear and reversible implementation steps.
- Make code understandable to the next engineer.

## 5. Mandatory Workflow for Every Task

Use this sequence:

1. **Inspect** relevant instructions, Git state, files, dependencies, and affected flows.
2. **Understand** current behavior, ownership boundaries, data relations, and deployment impact.
3. **Plan** the smallest safe implementation and validation strategy.
4. **Implement** only the requested scope using existing conventions.
5. **Validate** types, validation, authorization, data integrity, and edge states.
6. **Build** the active application before declaring development work complete.
7. **Browser test** visible behavior where applicable and tooling is available.
8. **Review Git diff** for accidental, unrelated, generated, or secret-containing changes.
9. **Report** exact changes, commands, results, and remaining issues.
10. **Commit only when explicitly instructed.**
11. **Push only when explicitly instructed.**

- Agents MUST state what they changed.
- Agents MUST distinguish pre-existing failures from failures introduced by their work.
- Read-only analysis tasks do not authorize implementation.

## 6. Change Safety Rules

Without direct authorization, MUST NOT:

- Run `git push --force` or any force-push variant.
- Perform destructive branch operations.
- Delete the repository or broad repository directories.
- Delete Vercel projects or deployments.
- Delete Vercel Blob stores.
- Delete Neon databases or branches.
- Run `prisma migrate reset`.
- Run destructive `prisma db push` operations.
- Drop tables, columns, or production constraints.
- Delete or rewrite production data.
- Rotate secrets or credentials.
- Change paid plans, billing, or subscription configuration.
- Expose `.env` contents.
- Commit secrets or credentials.
- Bypass authentication, authorization, ownership, or role checks.

- Resolve exact targets before any destructive operation.
- Prefer recoverable operations where possible.
- Stop and ask when destructive scope or authority is unclear.

## 7. Git Rules

- `main` is connected to production deployment through GitHub and Vercel.
- Always inspect `git status --short` before making changes.
- Never discard unrelated user changes.
- Never overwrite another contributor's uncommitted work.
- Never use `git reset --hard` unless explicitly authorized.
- Never force push.
- Review `git diff` before any commit.
- Build and test before requesting permission to commit.
- Commit messages SHOULD describe a completed feature or fix, not vague activity.
- Do not commit generated local artifacts, `.env` files, `node_modules`, `.next`, archives, logs, or temporary files.
- Do not commit partially generated migrations or build output.
- A GitHub push can trigger a Vercel production deployment; treat push as a production-impacting action.
- Do not commit or push unless the task explicitly requests it.

## 8. Environment and Secret Management

- `.env` and `.env.local` MUST never be committed.
- Never print secret values in chat, logs, screenshots, summaries, source files, or test fixtures.
- Refer to environment variables by name without exposing their values.
- Production secrets belong in the correct Vercel environment-variable scope.
- Local-only secrets belong in ignored environment files.
- `BLOB_READ_WRITE_TOKEN` is sensitive.
- `DATABASE_URL` is sensitive.
- `AUTH_SECRET` and all authentication secrets are sensitive.
- Future OpenAI, email, payment, OAuth, analytics, or storage credentials are sensitive.
- Never expose server secrets through `NEXT_PUBLIC_*` variables.
- Verify required variable names and availability without logging values.

## 9. Dependency Policy

- Prefer official packages and official integrations.
- Prefer stable, actively maintained, widely adopted dependencies.
- Avoid abandoned, obscure, or poorly documented packages.
- Check whether an existing dependency already solves the problem.
- Explain why a new dependency is needed before adding it.
- Avoid a dependency for trivial functionality that can be implemented safely in a few lines.
- MUST NOT run `npm audit fix --force` automatically.
- Do not perform broad dependency upgrades during unrelated feature work.
- Keep `prisma` and `@prisma/client` versions aligned.
- Review bundle, runtime, license, maintenance, and security impact.
- Update the lockfile only when dependency work is explicitly in scope.

## 10. TypeScript Rules

- Maintain strict TypeScript.
- No implicit `any`.
- Avoid explicit `any`; use precise types.
- Prefer `unknown` at untrusted boundaries and narrow it safely.
- Use Prisma-generated types where appropriate.
- Do not duplicate Prisma model types unnecessarily.
- Avoid unsafe type assertions.
- MUST NOT suppress errors with `@ts-ignore` except for an exceptional, documented reason.
- Do not disable strictness to make a build pass.
- Keep API request and response types explicit.
- Handle nullable database fields correctly.
- Model error and success states intentionally.
- Validate runtime input even when compile-time types exist.

## 11. Next.js 16 Rules

- Follow App Router conventions under `frontend/src/app`.
- Prefer Server Components unless interactivity requires `"use client"`.
- Keep client boundaries narrow to minimize browser JavaScript.
- Do not import server-only modules, Prisma, secrets, or Node-only APIs into Client Components.
- Implement REST-style Route Handlers under `src/app/api`.
- Respect Next.js 16 asynchronous `params` and request API behavior.
- Use `src/proxy.ts`; do not introduce deprecated `middleware.ts` conventions.
- Be careful with static rendering of database-dependent pages.
- Use `force-dynamic`, caching, or revalidation only when behavior justifies it.
- Avoid client-side fetching when a Server Component can render the data safely and clearly.
- Keep runtime and deployment choices compatible with Vercel.
- Consult the installed Next.js 16 documentation when framework behavior is uncertain.

## 12. React Rules

- Use functional components.
- Avoid unnecessary state and derived-state duplication.
- Avoid unnecessary effects.
- Clean up object URLs, event listeners, timers, observers, and subscriptions.
- Prevent duplicate requests and duplicate submissions.
- Handle loading, error, empty, and success states.
- Use accessible labels and keyboard interactions.
- Use stable semantic keys, not array indexes when identity exists.
- Avoid excessive prop drilling when a clearer existing pattern is available.
- Do not introduce global state unless the need is clear and justified.
- Keep form submission disabled while an equivalent request is pending.
- Preserve server/client separation.

## 13. Prisma and Database Rules

- `frontend/prisma/schema.prisma` is authoritative for database shape.
- Understand relations and lifecycle behavior before editing the schema.
- Keep migrations committed when schema changes are intentionally completed.
- Never casually edit historical migrations that may already be applied.
- Generate a new migration for intentional schema changes.
- Never reset production.
- Use transactions for logically atomic multi-write operations.
- Validate ownership before every update or delete.
- Respect unique constraints and handle conflicts clearly.
- Avoid N+1 query patterns.
- Select only necessary fields where practical, especially for public responses.
- Add indexes based on real query patterns, not speculation.
- Preserve referential integrity.
- Review cascade behavior before relation changes.
- Normalize identifiers and user-controlled strings where existing architecture does so.
- Plan deployment ordering for migrations and compatible application code.

## 14. Authentication and Authorization Rules

- Authentication alone is not authorization.
- Server-side authorization is mandatory.
- Never rely only on hidden or disabled UI controls.
- Verify user identity before profile operations.
- Verify record ownership before mutation.
- Verify employer and admin roles server-side.
- `ADMIN` and `SUPER_ADMIN` checks MUST remain explicit.
- Never trust a role, user ID, company ID, profile ID, job ID, or ownership value supplied by the browser without verification.
- Protected APIs MUST use `auth()` or the established authenticated helper.
- Avoid leaking private user data in pages, APIs, logs, or errors.
- Maintain role enforcement in `src/proxy.ts` and in sensitive server operations.
- Credentials authentication currently uses JWT sessions; changes require careful compatibility review.

## 15. API Design Rules

- Validate request bodies with Zod or established project validators.
- Return consistent success/error JSON structures.
- Use appropriate HTTP status codes.
- Distinguish validation, unauthorized, forbidden, not found, conflict, and server errors.
- Do not return stack traces or internal implementation details.
- Log server errors with useful operation context but no secrets.
- Validate and bound query parameters.
- Normalize user-controlled strings where required.
- Limit request and response payload size.
- Perform ownership checks before mutations.
- Use idempotency where duplicate execution can cause harm.
- Do not expose fields merely because Prisma returned them.
- Keep public and private response selections explicit.

## 16. File Upload and Vercel Blob Rules

- The connected Vercel Blob store is private.
- Never trust file extensions alone.
- Validate allowed MIME type, extension, and size server-side.
- Generate controlled storage paths.
- Do not use user-provided filenames directly as trusted paths.
- Sanitize display filenames and prevent path traversal.
- Associate every uploaded object with an authenticated owner and relevant database record.
- Clean up a newly uploaded Blob object if database persistence fails.
- Clean up replaced or deleted Blob objects when safe and ownership is proven.
- Do not delete a file that may belong to another record or user.
- Never expose `BLOB_READ_WRITE_TOKEN` to a client.
- Private files require controlled serving or access authorization.
- Treat resume privacy more strictly than public profile images.
- Add abuse and rate-limit protections before upload endpoints are publicly launched.
- Log storage identifiers carefully without logging credentials or sensitive document content.

## 17. Image Upload Policy

- Accepted profile-image source formats are JPG/JPEG, PNG, and WEBP.
- Reject SVG and arbitrary executable formats for profile-photo upload.
- Prefer client-side image processing before upload, with server-side validation still mandatory.
- Auto-crop profile pictures to a square.
- Resize to reasonable maximum dimensions.
- Convert and compress to WebP where browser support and implementation allow.
- Target a small optimized output instead of storing huge originals.
- Intended profile-photo workflow:
  `select/drop -> validate -> crop -> resize -> compress -> preview -> upload -> DB update -> replace/delete cleanup`.
- Preserve visual quality appropriate for a professional profile.
- Automatically reduce large user images so users need not manually reduce KB or MB.
- Revoke local preview object URLs when they are no longer needed.
- Resume auto-compression is not part of this image policy.

## 18. Resume File Policy

- Intended formats include PDF and DOCX; confirm the exact allowlist in implementation before launch.
- Enforce a strict file-size limit.
- Store resumes privately.
- Validate both MIME type and extension.
- Never execute or render untrusted documents as HTML.
- Resume records MUST belong to the authenticated candidate.
- Multiple resume versions may exist.
- Default-resume behavior must remain internally consistent during create, update, and delete operations.
- Authorize every download or controlled access operation.
- Resume compression is a later advanced feature; do not implement unsafe compression casually.
- Compression MUST NOT damage ATS readability, text extraction, or document integrity.

## 19. UI and Design System Rules

- Follow consistent Tailwind CSS conventions.
- Reuse components in `src/components/common` and `src/components/ui` where suitable.
- Check existing components before creating another Button, Card, Badge, input, section title, or layout primitive.
- Maintain a professional career-platform visual style.
- Use clear visual hierarchy and readable content density.
- Design responsively with mobile-first behavior.
- Maintain accessible contrast and visible focus states.
- Provide proper loading and disabled states.
- Show useful, actionable error messages.
- Avoid excessive animation.
- Avoid preventable layout shifts.
- Prevent design drift across candidate, employer, job, and company areas.

## 20. External UI Library and Plugin Policy

- External design libraries or plugins may be used when they materially improve quality.
- Prefer production-proven, actively maintained, high-quality tools.
- Prefer official integrations.
- Verify license suitability.
- Do not add a large library for one small component.
- Avoid overlapping UI frameworks.
- New UI libraries MUST integrate with Tailwind and existing design conventions.
- Explain dependency, bundle, maintenance, and styling impact before installation.
- Do not introduce a plugin merely because it is available.

## 21. Performance Rules

Performance optimization is a dedicated later phase, but new code MUST NOT knowingly introduce major performance problems.

- Avoid unnecessary database calls.
- Avoid N+1 queries.
- Minimize client JavaScript.
- Prefer Server Components.
- Lazy-load heavy optional UI.
- Optimize uploaded and displayed images.
- Avoid large dependencies.
- Use pagination for potentially large datasets.
- Consider caching and revalidation when semantically correct.
- Avoid blocking page rendering unnecessarily.
- Keep bundle impact in mind.

The final Performance Optimization Phase will include:

- Lighthouse audit.
- Bundle analysis.
- Image optimization.
- Lazy loading and dynamic imports.
- Prisma query optimization.
- Evidence-based database indexes.
- Caching and revalidation review.
- Core Web Vitals.
- Mobile performance.
- Console errors and network waterfalls.
- SEO review.
- Strong Lighthouse score targets without manipulating metrics at the expense of functionality.

## 22. Accessibility Rules

- Use semantic HTML.
- Associate form controls with visible or accessible labels.
- Support keyboard navigation and activation.
- Preserve visible focus indicators.
- Provide meaningful image alt text; use empty alt text for truly decorative images.
- Use ARIA only where native semantics are insufficient.
- Make errors, validation feedback, loading states, and status messages perceivable.
- Avoid click-only inaccessible controls.
- Implement accessible focus management, escape behavior, labeling, and focus return for dialogs.
- Test core flows without a mouse where practical.

## 23. Security Rules

- Treat all browser input as untrusted.
- Validate server-side even when client validation exists.
- Prevent XSS and avoid unsafe HTML rendering.
- Protect CSRF-sensitive flows using framework and authentication conventions.
- Prevent IDOR through server-side ownership validation.
- Do not leak private candidate resumes.
- Rate-limit abuse-prone public APIs before launch.
- Secure all file-upload boundaries.
- Implement password reset with secure, expiring, single-use tokens.
- Email verification and anti-spam controls are required before public launch where appropriate.
- Never put secrets in client bundles.
- Review dependencies and external services for supply-chain and data risks.
- A security review is mandatory before beta launch.

## 24. Error Handling and Logging

- User-facing messages SHOULD be understandable and actionable.
- Internal logs SHOULD identify the operation and relevant non-sensitive context.
- Never log passwords, tokens, full secrets, private documents, or unnecessary personal data.
- Do not silently swallow failures.
- Preserve the primary operation result when a secondary cleanup failure can safely be logged separately.
- Do not expose raw database, storage, or authentication errors to users.
- Handle expected conflicts explicitly.
- Production errors should eventually integrate with a monitoring platform.
- Monitoring must observe the same privacy and secret-handling rules.

## 25. Testing Rules

- Every feature requires validation proportional to its risk.
- Always run the production build before declaring development work complete.
- Browser-test user-facing features.
- Test success, validation error, server error, empty, unauthorized, forbidden, and edge states as relevant.
- Test candidate and employer roles separately.
- Test responsive behavior.
- Test database mutations carefully and verify ownership boundaries.
- The future automated suite SHOULD cover unit, integration, and end-to-end flows.
- Never claim a test passed unless it was actually run and completed successfully.
- Do not treat compilation alone as functional testing.

## 26. Browser Testing Rules

- Browser testing is required for visible features where tooling is available.
- Check the browser console.
- Check failed and unexpected network requests.
- Exercise forms, validation, navigation, and submission behavior.
- Test loading, error, empty, disabled, and success states.
- Test desktop and mobile viewports where practical.
- Verify keyboard behavior for interactive controls.
- Never assume build success means UI success.
- Report any browser-testing limitation explicitly.

## 27. Build Rules

- Run the active application build from `C:\career-platform\frontend`.
- Standard command: `npm run build`.
- On Windows/PowerShell hosts where `npm.ps1` is blocked, use `npm.cmd run build`.
- The production build MUST pass before feature completion.
- Do not hide type errors by weakening TypeScript.
- Resolve warnings when they indicate correctness, compatibility, security, or deprecation risk.
- Document harmless warnings separately.
- Current known exception: empty upload route placeholders make route validation fail; do not describe the overall build as passing until resolved by the relevant task.

## 28. Code Quality Rules

- Prefer clear code over clever code.
- Use small, focused functions.
- Use descriptive names.
- Remove dead code only when verified unused and within task scope.
- Avoid giant components when a clean extraction materially improves clarity.
- Do not refactor unrelated working areas during a focused feature task.
- Comments should explain why, constraints, or non-obvious tradeoffs—not restate obvious code.
- Avoid formatting churn unrelated to the requested work.
- Keep domain logic out of presentation code when an existing service or helper boundary fits.
- Preserve consistent response and validation patterns.

## 29. Duplication Policy

Known duplication currently includes:

- Multiple Badge implementations.
- Multiple SectionTitle implementations.
- Multiple footer implementations.
- Multiple company component families.
- Two job-detail component families.

- Do not casually add more duplication.
- Inspect both component families before selecting an extension point.
- Consolidation belongs in a dedicated refactor phase after functionality is stable.
- Do not perform broad consolidation during unrelated feature work.

## 30. Current Known Gaps

Document these as pre-existing gaps; do not fix them unless the task requests it:

- `src/app/api/upload/photo/route.ts` is an empty placeholder.
- `src/app/api/upload/resume/route.ts` is an empty placeholder.
- Actual Vercel Blob upload behavior is not implemented.
- `/dashboard/resume` navigation exists without a page.
- `/dashboard/settings` navigation exists without a page.
- Forgot/reset-password UI lacks a complete backend and email flow.
- Employer dashboard statistics are placeholders.
- Social-login UI exists without configured OAuth providers.
- Automated test coverage is insufficient.
- Duplicate component families exist.
- README and operational documentation need improvement.
- The empty upload route files currently cause Next.js production route validation to fail.

## 31. Development Priority and Roadmap

The Product Owner or technical lead may change this order.

Immediate priorities:

1. Establish this `AGENTS.md` guide.
2. Implement production profile-photo upload with Vercel Blob.
3. Add automatic client-side image crop, resize, and compression.
4. Integrate and browser-test photo management.
5. Implement production resume upload.
6. Complete missing profile and dashboard functions.

Later core work:

- Notifications and email system.
- Secure password recovery.
- Admin panel.
- Employer analytics.
- Candidate and recruiter search improvements.
- AI features and ATS tools.
- AI resume builder and cover-letter generation.
- Job recommendations.
- Monetization and premium features.

Final pre-launch phases:

- Duplication refactor.
- Security audit.
- Performance optimization.
- SEO and analytics.
- Legal pages.
- Automated tests.
- Beta testing.
- Production launch checklist.

## 32. Performance Phase Reminder

- Do not perform broad premature optimization during unrelated feature implementation.
- Do not introduce obviously inefficient architecture.
- A dedicated final optimization phase will inspect:
  - Slow pages.
  - Large bundles.
  - Unnecessary rerenders.
  - Prisma queries and N+1 problems.
  - Database indexes.
  - Caching and static/dynamic rendering choices.
  - Images and fonts.
  - Network waterfalls.
  - Core Web Vitals and Lighthouse.
  - Mobile performance.
- Optimize from evidence and measurements, not guesses.

## 33. AI Feature Rules

- Isolate AI features behind clear service boundaries.
- Never expose provider API keys client-side.
- Validate and limit prompt input.
- Control cost, token usage, retries, and concurrency.
- Store only necessary AI data.
- Handle provider failure, timeout, and unavailability gracefully.
- Do not present AI output as guaranteed fact.
- Make ATS and resume recommendations explainable where practical.
- AI functionality SHOULD degrade gracefully when unavailable.
- Review personal-data handling before sending candidate data to an AI provider.
- Product approval is required for new AI behavior and material cost exposure.

## 34. Monetization Rules

Future monetization may include:

- Premium candidate features.
- Employer plans.
- Featured jobs.
- Featured companies.
- AI tools.
- Subscriptions.

- Never introduce billing behavior without explicit Product Owner approval.
- Use a production-grade payment provider when the payment phase begins.
- Never store raw card details.
- Verify webhook signatures and payment state server-side.
- Treat client-reported payment success as untrusted.
- Make entitlement and subscription transitions auditable.

## 35. Deployment Rules

- GitHub `main` is connected to Vercel.
- A push can trigger production deployment.
- Run the local production build before any authorized push.
- Confirm the Vercel deployment after a production-impacting push.
- Required environment variables MUST exist in the correct Vercel environment.
- Plan database migrations deliberately for deployment.
- Never assume local environment configuration equals production.
- Verify Blob connection and token availability for upload features without exposing values.
- Prefer backward-compatible application/database deployment sequences.
- Report deployment failures and do not claim production success without verification.

## 36. Data Backup and Recovery

- Source code is protected through completed GitHub pushes.
- Database data lives in Neon PostgreSQL.
- Uploaded files live in Vercel Blob.
- Local `.env` files are not protected by Git and require secure backup.
- Important local secrets SHOULD have an encrypted backup.
- Never commit secrets as a backup strategy.
- Uncommitted work is at risk if the local machine fails.
- Commit and push completed work regularly only when authorized by the workflow owner.
- Review provider backup, retention, and restore procedures before public launch.
- Test recovery plans safely; do not discover them during an incident.

## 37. Documentation Rules

- Update documentation when architecture, setup, operations, or deployment materially changes.
- Document required environment-variable names without values.
- Document migration and deployment implications.
- Keep operational instructions reproducible.
- Do not leave stale setup instructions after changing a workflow.
- Document known limitations honestly.
- Keep public documentation free of private paths, personal information, and secrets unless the repository-specific path is intentionally required here.

## 38. Agent Communication Rules

Coding agents MUST:

- Be concise but complete.
- State material assumptions.
- Ask only when required information cannot be safely derived.
- Never claim a command, test, build, or browser check was run if it was not.
- Report exact files changed.
- Report commands run.
- Report build and test outcomes.
- Report remaining known issues.
- Distinguish pre-existing issues from newly introduced issues.
- State when validation could not be performed and why.
- Avoid implying production deployment unless it was verified.

## 39. Completion Checklist

Before marking a development task complete, consider every item:

- [ ] Requested scope implemented.
- [ ] No unrelated changes.
- [ ] Authorization verified.
- [ ] Validation handled.
- [ ] Loading, error, and empty states handled.
- [ ] Types correct.
- [ ] No secrets exposed.
- [ ] Database ownership and data integrity checked.
- [ ] Relevant browser flow tested.
- [ ] Console and network checked where applicable.
- [ ] Production build passed.
- [ ] Git diff reviewed.
- [ ] Files changed reported.
- [ ] No commit unless requested.
- [ ] No push unless requested.
- [ ] Remaining issues disclosed.

## 40. Absolute Never Rules

An agent MUST NEVER, without explicit authorization:

- Destroy production data.
- Reset the production database.
- Force push.
- Expose secrets.
- Commit `.env` files.
- Weaken authentication to fix an error.
- Bypass ownership checks.
- Disable TypeScript strictness to make a build pass.
- Use `@ts-ignore` as a shortcut.
- Silently change schema semantics.
- Silently introduce a paid dependency or service.
- Perform broad unrelated refactors.
- Claim tests were run when they were not.
- Push to production without authorization.

## 41. Decision Authority

- Product and business decisions belong to the Product Owner.
- Explain architecture and implementation recommendations, including meaningful tradeoffs.
- Agents may recommend alternatives but MUST NOT silently change product behavior.
- Explicit task instructions override roadmap order unless unsafe.
- When a decision materially changes scope, cost, privacy, security, or user behavior, obtain direction rather than guessing.

## 42. Final Philosophy

Build for correctness first, maintainability second, security always, performance deliberately, and scale when evidence requires it.

Preserve working systems.

Make changes understandable to the next engineer.

A feature is not complete merely because it compiles; it must work correctly for the intended user.
