# AD Arcade — Serpent Shift mobile release

## Current status
Playable prototype source committed on a development branch. Not yet verified on devices, signed, uploaded, or approved by either store.

## Free tooling
Node.js, Capacitor (MIT), Android Studio, Xcode (macOS), GitHub Actions. Apple's developer program and Google Play developer registration have separate required fees.

## Local web test
Serve the `reborn/` directory with any static server, e.g. `python3 -m http.server 8080 -d reborn`. Open http://localhost:8080.

## Mobile build
1. Install Node.js and run `npm install`.
2. Run `npx cap add android` and `npx cap add ios` (iOS requires macOS/Xcode).
3. Run `npm run sync`.
4. Open with `npx cap open android` or `npx cap open ios`.
5. Test on physical devices, replace SVG placeholder with platform-specific raster icons and splash screens, configure privacy disclosures, signing and bundle IDs.
6. Build signed Android App Bundle in Android Studio and iOS archive in Xcode, then submit via Play Console and App Store Connect.

## Release blockers
- Manual gameplay QA, accessibility and performance testing.
- Platform icon and screenshots, store descriptions and privacy policy.
- Developer accounts, certificates, review and publishing approval.
- Check the bundle identifier is available before publishing.
- Online leaderboard requires a real backend and abuse protection; current best score is device-local.

## License note
Original prototype code. Verify third-party asset and dependency licenses before distribution. Do not assume a game mechanic or title is legally exclusive.
