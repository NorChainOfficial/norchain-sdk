# Web App Scripts

## Available Scripts

### `validate-env.sh`
Validates environment variables before running the app.

```bash
./scripts/validate-env.sh
```

### `pre-build.sh`
Runs pre-build validation checks (environment, dependencies, types).

```bash
./scripts/pre-build.sh
```

## Usage

All scripts are executable and can be run directly:

```bash
cd web-wallet
./scripts/validate-env.sh
```

## Integration

These scripts can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Validate Environment
  run: ./web-wallet/scripts/validate-env.sh

- name: Pre-build Checks
  run: ./web-wallet/scripts/pre-build.sh
```

