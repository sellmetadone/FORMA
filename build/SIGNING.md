# Code signing (Windows)

FORMA does not embed certificates in the repository.

| Variable | Purpose |
|----------|---------|
| `CSC_LINK` | Path or URL to `.pfx` / `.p12` |
| `CSC_KEY_PASSWORD` | Certificate password |

```bash
export CSC_LINK="C:/certs/forma.pfx"
export CSC_KEY_PASSWORD="***"
npm run electron:build
```
