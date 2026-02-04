/**
 * Configuration centralisée des routes (React Router v7).
 * - Layouts : _public (splash, login) et _app (toutes les pages authentifiées).
 * - Code splitting automatique par route (lazy loading).
 * - Route splat "*" en dernier pour la page 404.
 */
import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    index("routes/index.tsx"),

    layout("routes/_public.tsx", [
        route("splash", "routes/splash.tsx"),
        route("login", "routes/login.tsx"),
    ]),

    layout("routes/_app.tsx", [
        route("home", "routes/home.tsx"),
        route("profile", "routes/profile.tsx"),
        route("manage-profile", "routes/manage-profile.tsx"),
        route("theme-settings", "routes/theme-settings.tsx"),
        route("language-settings", "routes/language-settings.tsx"),
        route("help", "routes/help.tsx"),
        route("community", "routes/community.tsx"),
        route("community/friends", "routes/community-friends.tsx"),
        route("community/invitations", "routes/community-invitations.tsx"),
        route("community/conversations", "routes/community-conversations.tsx"),
        route("community/activity", "routes/community-activity.tsx"),
        route("community/shares", "routes/community-shares.tsx"),
        route("community/family", "routes/community-family.tsx"),
        route("upload", "routes/upload.tsx"),
        route("musics", "routes/musics.tsx"),
        route("films", "routes/films.tsx"),
        route("series", "routes/series.tsx"),
        route("videos", "routes/videosRedirect.tsx"),
        route("library", "routes/library.tsx"),
        route("images", "routes/libraryRedirect.images.tsx"),
        route("documents", "routes/libraryRedirect.documents.tsx"),
        route("archives", "routes/libraryRedirect.archives.tsx"),
        route("executables", "routes/libraryRedirect.executables.tsx"),
        route("others", "routes/libraryRedirect.others.tsx"),
        route("lecteur-local", "routes/lecteur-local.tsx"),
        route("reader/:category/:fileId", "routes/reader.tsx"),
        route("match/:category/:fileId", "routes/match.tsx"),
        route("info/:category/:fileId", "routes/info.tsx"),
    ]),

    route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
