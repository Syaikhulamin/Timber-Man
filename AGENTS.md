# Guidelines

## Commit
Gunakan [Conventional Commits](https://www.conventionalcommits.org/) untuk setiap commit.
Format: `<type>(<scope>): <description>`

Tipe yang digunakan: `feat`, `fix`, `chore`, `refactor`, `docs`, `style`, `perf`, `test`.

Contoh:
- `feat(auth): add login endpoint`
- `fix(api): handle null response on get user`
- `chore(deps): update go version to 1.22`

## Build
Source JS ada di `src/`, minified output ke `js/`.
Jalankan `./build.sh` setelah edit file di `src/` sebelum deploy.
