# Contributing to FORMA

Thank you for your interest in contributing.

## Principles

1. Quality of architecture over quantity of features.
2. Real functionality — no decorative buttons.
3. TypeScript strict mode; do not ignore type errors.
4. Modules communicate only through interfaces and the Event Bus.
5. UI must not call Node.js or system APIs directly.
6. All system changes must be reversible and confirmed by the user.

## Development workflow

1. Fork and create a branch from `main`.
2. Use conventional commit messages:
   - `feat: add theme engine`
   - `fix: resolve profile persistence`
   - `refactor: improve module registry`
   - `docs: update installation guide`
3. Run type check and tests before opening a PR.
4. Keep PRs focused and reasonably small.

## Code style

- TypeScript + React function components.
- CSS Modules + design tokens (CSS variables).
- Prefer explicit types over `any`.
- No secrets, tokens or local paths in the repository.

## Reporting issues

Use GitHub Issues. Include:

- FORMA version
- Windows version
- Steps to reproduce
- Expected vs actual behaviour

## License

By contributing you agree that your contributions will be licensed under the MIT License.
