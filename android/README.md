# Android / TWA

This directory contains the configuration used to build **صلوات‌شمار شفا** as a Trusted Web Activity (TWA).

- Application ID: `ir.rimnova.salavat`
- PWA: `https://rimnova.github.io/salavat/webapp/`
- Version: `1.0.0` / versionCode `1`
- Build system: Bubblewrap + GitHub Actions
- Release keystore is **not** stored in this repository.

## GitHub Actions secrets

Create these repository secrets:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_PASSWORD`

The keystore must contain the release key with alias `android`.

## Important: Digital Asset Links

A verified TWA requires:

`https://rimnova.github.io/.well-known/assetlinks.json`

The workflow produces the correct `assetlinks.json` for the release certificate as an artifact. It must be served from the **root of the app's origin**, not from `/salavat/webapp/.well-known/`.

Because this project currently uses the GitHub Pages project-site origin `rimnova.github.io`, root-level hosting of `.well-known/assetlinks.json` must be confirmed or a custom domain/root origin must be used.

## Build

Open GitHub → Actions → **Build Salavat Android AAB** → Run workflow.

Artifacts:

- `salavat-android-aab` → signed AAB
- `salavat-android-apk` → signed APK
- `salavat-assetlinks` → Digital Asset Links file
