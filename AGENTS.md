# Agent working agreement

These instructions apply to the whole repository. More specific `AGENTS.md`
files may narrow them for a subdirectory, but may not weaken the safety,
verification, or atomic-commit rules below.

## Start with the smallest useful context

- Read the root `README.md`, this file, and only the documents and source files
  needed for the assigned responsibility.
- Do not load the whole repository by default. Expand context only when an
  interface or dependency cannot be understood from the current task boundary.
- Treat `app/` as the production Next.js storefront and `design-prototype/` as
  historical design reference unless the task explicitly says otherwise.
- Follow `docs/DATA-LAYER.md` for storefront data boundaries.

## Divide work by responsibility

Choose agent boundaries according to independent areas of responsibility and
the amount of work, not according to a fixed number of agents.

Typical bounded areas are:

- **Storefront UI:** routes, Chakra components, accessibility, responsive
  behaviour, and client interaction state.
- **Shopify and server data:** Storefront GraphQL, data types, mappers, loaders,
  route handlers, cookies, and normalized commerce errors.
- **Compliance:** Shopify policies, consent state, privacy controls, and legal
  content presentation.
- **Quality:** unit/integration/E2E infrastructure, CI, fixtures, and release
  verification.

Give one agent only the files, interfaces, acceptance criteria, and test
commands required by its bounded area. If an area is too large to review as one
coherent change, split it by a stable interface and complete the provider side
before the consumer side. Do not run agents concurrently when they would edit
the same files or depend on an interface that has not been accepted yet.

Every delegated task must state:

1. the single outcome it owns;
2. files or directories it may change;
3. interfaces it consumes and produces;
4. behaviour it must not change;
5. exact verification commands;
6. the expected atomic commit boundary.

## Keep commits atomic

- One commit represents one independently understandable, reviewable, and
  revertible behaviour or documentation change.
- Do not mix refactoring, formatting, documentation, dependency upgrades, and
  product behaviour unless they are inseparable from the same outcome.
- Keep setup and tests in the commit that needs them; do not create placeholder
  scaffolding commits.
- Use Conventional Commit messages such as `feat(cart): ...`,
  `test(cart): ...`, `docs: ...`, or `chore(next): ...`.
- Before committing, inspect `git diff`, run the task-specific tests, and stage
  explicit paths. Never use a broad stage operation when unrelated changes are
  present.
- Do not rewrite, squash, amend, or discard commits or user changes unless the
  user explicitly requests it.

## Implement against stable boundaries

- UI code must consume app/domain types and must not parse raw Shopify GraphQL
  responses.
- Shopify access belongs in `app/src/data/shopify`; mapping belongs in
  `app/src/data/mappers`; orchestration belongs in `app/src/data/loaders` or a
  narrowly scoped server route.
- `mock/` data is test/development data and must never silently become a
  production Shopify fallback.
- Shopify remains the source of truth for merchandise IDs, prices, cart totals,
  availability, and checkout URLs.
- Never expose private Shopify tokens, commit environment files, log secrets, or
  construct a Shopify checkout URL manually.

## Verify every change

- Behaviour changes use test-first development where practical: failing test,
  minimal implementation, passing test.
- Run the narrowest relevant test while iterating, then the broader affected
  suite before committing.
- For production-affecting work, the final verification includes, from `app/`:
  `npm run lint`, the repository test command, and `npm run build`.
- A task is not complete while tests are skipped, failures are unexplained, or
  required merchant/deployment actions are undocumented.

