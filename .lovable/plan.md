

# Fix: Update react-router-dom to Patch XSS Vulnerability

## Problem

The current `react-router-dom` version **6.30.1** has a known XSS vulnerability via open redirects in `@remix-run/router`.

## Solution

Update `react-router-dom` to the latest patched version (`6.31.0` or newer) which resolves this advisory.

## Technical Details

Update `package.json`:

```text
"react-router-dom": "^6.31.0"
```

This is a minor version bump with no breaking changes -- no code modifications needed.

