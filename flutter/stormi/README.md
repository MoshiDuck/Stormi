# Stormi (Flutter)

App Flutter pour **Stormi** — **Android et iOS uniquement** (pas web). Connexion via Firebase (Google) + API stormi.uk.

## Plateformes

- **Android** / **iOS** : config Firebase (google-services.json, GoogleService-Info.plist) + SHA-1 / bundle ID.

## Nouveau projet Google Cloud / Firebase

Si tu as créé un **nouveau projet** Google et que la connexion échoue (sign_in_failed, ApiException 10, ou « flowName=GeneralOAuthFlow »), suis la checklist :  
**[docs/NOUVEAU_PROJET_GOOGLE.md](docs/NOUVEAU_PROJET_GOOGLE.md)**

Points importants : **écran de consentement OAuth** configuré, **client Web** + **client Android** (package + SHA-1) dans le **même** projet, et **GOOGLE_CLIENT_ID** dans Cloudflare = ID du client **Web**.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Learn Flutter](https://docs.flutter.dev/get-started/learn-flutter)
- [Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Flutter learning resources](https://docs.flutter.dev/reference/learning-resources)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.
