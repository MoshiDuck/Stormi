// INFO : app/contexts/ThemeContext.tsx
// Thème par utilisateur : light, dark, grey + jusqu'à 10 thèmes personnalisés (couleur → thème).

import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { useAuth } from '~/hooks/useAuth';
import type { ThemeId } from '~/utils/ui/theme';
import {
    getThemeById,
    isBuiltInThemeId,
    buildThemeFromColor,
    createCustomThemeId,
    type AppTheme,
    type CustomThemeEntry,
} from '~/utils/ui/theme';

const STORAGE_PREFIX = 'stormi_theme_';
const CUSTOM_STORAGE_PREFIX = 'stormi_custom_themes_';

export type ResolvedThemeId = ThemeId | string;

interface ThemeContextType {
    themeId: ResolvedThemeId;
    setThemeId: (id: ResolvedThemeId) => void;
    theme: AppTheme;
    customThemes: CustomThemeEntry[];
    addCustomTheme: (name: string, baseColor: string) => string | null;
    removeCustomTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getThemeStorageKey(userId: string | undefined): string {
    return userId ? `${STORAGE_PREFIX}${userId}` : `${STORAGE_PREFIX}guest`;
}

function getCustomStorageKey(userId: string | undefined): string {
    return userId ? `${CUSTOM_STORAGE_PREFIX}${userId}` : `${CUSTOM_STORAGE_PREFIX}guest`;
}

const MAX_CUSTOM_THEMES = 10;

function loadThemeId(key: string): ResolvedThemeId {
    if (typeof window === 'undefined') return 'dark';
    try {
        const raw = localStorage.getItem(key);
        if (raw === 'light' || raw === 'dark' || raw === 'grey') return raw;
        if (raw && raw.startsWith('custom_')) return raw;
    } catch (_) {}
    return 'dark';
}

function saveThemeId(key: string, id: ResolvedThemeId): void {
    try {
        localStorage.setItem(key, id);
    } catch (_) {}
}

function loadCustomThemes(key: string): CustomThemeEntry[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
            (x): x is CustomThemeEntry =>
                typeof x === 'object' &&
                x !== null &&
                typeof (x as CustomThemeEntry).id === 'string' &&
                typeof (x as CustomThemeEntry).name === 'string' &&
                typeof (x as CustomThemeEntry).baseColor === 'string' &&
                typeof (x as CustomThemeEntry).theme === 'object'
        );
    } catch (_) {
        return [];
    }
}

function saveCustomThemes(key: string, list: CustomThemeEntry[]): void {
    try {
        localStorage.setItem(key, JSON.stringify(list));
    } catch (_) {}
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const themeStorageKey = getThemeStorageKey(user?.id);
    const customStorageKey = getCustomStorageKey(user?.id);

    const [themeId, setThemeIdState] = useState<ResolvedThemeId>(() => loadThemeId(themeStorageKey));
    const [customThemes, setCustomThemesState] = useState<CustomThemeEntry[]>(() =>
        loadCustomThemes(customStorageKey)
    );

    useEffect(() => {
        setThemeIdState(loadThemeId(themeStorageKey));
        setCustomThemesState(loadCustomThemes(customStorageKey));
    }, [themeStorageKey, customStorageKey]);

    const setThemeId = useCallback(
        (id: ResolvedThemeId) => {
            setThemeIdState(id);
            saveThemeId(themeStorageKey, id);
        },
        [themeStorageKey]
    );

    const addCustomTheme = useCallback(
        (name: string, baseColor: string): string | null => {
            const list = loadCustomThemes(customStorageKey);
            if (list.length >= MAX_CUSTOM_THEMES) return null;
            const id = createCustomThemeId();
            const theme = buildThemeFromColor(baseColor);
            const entry: CustomThemeEntry = { id, name: name.trim() || id, baseColor, theme };
            const next = [...list, entry];
            setCustomThemesState(next);
            saveCustomThemes(customStorageKey, next);
            return id;
        },
        [customStorageKey]
    );

    const removeCustomTheme = useCallback(
        (id: string) => {
            const list = loadCustomThemes(customStorageKey).filter((t) => t.id !== id);
            setCustomThemesState(list);
            saveCustomThemes(customStorageKey, list);
            if (themeId === id) {
                setThemeIdState('dark');
                saveThemeId(themeStorageKey, 'dark');
            }
        },
        [customStorageKey, themeId, themeStorageKey]
    );

    const theme = useMemo(() => {
        if (isBuiltInThemeId(themeId)) return getThemeById(themeId);
        const custom = customThemes.find((t) => t.id === themeId);
        return custom ? custom.theme : getThemeById('dark');
    }, [themeId, customThemes]);

    const value = useMemo<ThemeContextType>(
        () => ({
            themeId,
            setThemeId,
            theme,
            customThemes,
            addCustomTheme,
            removeCustomTheme,
        }),
        [themeId, setThemeId, theme, customThemes, addCustomTheme, removeCustomTheme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
    const ctx = useContext(ThemeContext);
    if (ctx === undefined) {
        throw new Error('useTheme doit être utilisé à l\'intérieur de ThemeProvider');
    }
    return ctx;
}
