// INFO : app/utils/theme.ts
// Thèmes globaux : dark (défaut), light, grey

export type ThemeId = 'light' | 'dark' | 'grey';

export type AppTheme = {
    background: { primary: string; secondary: string; tertiary: string; nav: string };
    text: { primary: string; secondary: string; tertiary: string; disabled: string };
    accent: { blue: string; blueHover: string; green: string; greenHover: string; red: string; redHover: string; orange: string; purple: string };
    border: { primary: string; secondary: string; light: string };
    surface: { info: string; success: string; warning: string; error: string };
    shadow: { small: string; medium: string; large: string; glow: string };
    transition: { fast: string; normal: string; slow: string };
    radius: { small: string; medium: string; large: string; xlarge: string };
};

export const darkTheme: AppTheme = {
    background: {
        primary: '#0a0a0a',
        secondary: '#1a1a1a',
        tertiary: '#252525',
        nav: '#151515',
    },
    text: {
        primary: '#ffffff',
        secondary: '#d1d1d1',
        tertiary: '#a8a8a8',
        disabled: '#888888',
    },
    accent: {
        blue: '#4285f4',
        blueHover: '#357ae8',
        green: '#34a853',
        greenHover: '#2d8a47',
        red: '#ea4335',
        redHover: '#d33b2c',
        orange: '#ff9800',
        purple: '#9c27b0',
    },
    border: {
        primary: '#3a3a3a',
        secondary: '#444444',
        light: '#505050',
    },
    surface: {
        info: '#1a2a3a',
        success: '#1a2a1a',
        warning: '#3a2525',
        error: '#3a1a1a',
    },
    shadow: {
        small: '0 2px 8px rgba(0,0,0,0.4)',
        medium: '0 4px 16px rgba(0,0,0,0.5)',
        large: '0 8px 32px rgba(0,0,0,0.6)',
        glow: '0 0 20px rgba(66, 133, 244, 0.3)',
    },
    transition: { fast: '0.15s ease', normal: '0.2s ease', slow: '0.3s ease' },
    radius: { small: '6px', medium: '8px', large: '12px', xlarge: '16px' },
};

export const lightTheme: AppTheme = {
    background: {
        primary: '#f5f5f5',
        secondary: '#ffffff',
        tertiary: '#eeeeee',
        nav: '#ffffff',
    },
    text: {
        primary: '#1a1a1a',
        secondary: '#4a4a4a',
        tertiary: '#6b6b6b',
        disabled: '#9e9e9e',
    },
    accent: {
        blue: '#1a73e8',
        blueHover: '#1557b0',
        green: '#1e8e3e',
        greenHover: '#177d34',
        red: '#d93025',
        redHover: '#b71c1c',
        orange: '#e37400',
        purple: '#7c4dff',
    },
    border: {
        primary: '#dadce0',
        secondary: '#e8eaed',
        light: '#f1f3f4',
    },
    surface: {
        info: '#e8f0fe',
        success: '#e6f4ea',
        warning: '#fce8e6',
        error: '#fce8e6',
    },
    shadow: {
        small: '0 1px 3px rgba(0,0,0,0.12)',
        medium: '0 2px 6px rgba(0,0,0,0.14)',
        large: '0 4px 12px rgba(0,0,0,0.16)',
        glow: '0 0 20px rgba(26, 115, 232, 0.25)',
    },
    transition: { fast: '0.15s ease', normal: '0.2s ease', slow: '0.3s ease' },
    radius: { small: '6px', medium: '8px', large: '12px', xlarge: '16px' },
};

export const greyTheme: AppTheme = {
    background: {
        primary: '#2d2d2d',
        secondary: '#3d3d3d',
        tertiary: '#4a4a4a',
        nav: '#383838',
    },
    text: {
        primary: '#e8e8e8',
        secondary: '#b8b8b8',
        tertiary: '#909090',
        disabled: '#707070',
    },
    accent: {
        blue: '#5c7cfa',
        blueHover: '#4c6ef5',
        green: '#51cf66',
        greenHover: '#40c057',
        red: '#ff6b6b',
        redHover: '#fa5252',
        orange: '#ffa94d',
        purple: '#cc5de8',
    },
    border: {
        primary: '#4a4a4a',
        secondary: '#5a5a5a',
        light: '#6a6a6a',
    },
    surface: {
        info: '#3d4a5c',
        success: '#3d4a3d',
        warning: '#5c4a4a',
        error: '#5c3d3d',
    },
    shadow: {
        small: '0 2px 8px rgba(0,0,0,0.35)',
        medium: '0 4px 16px rgba(0,0,0,0.4)',
        large: '0 8px 32px rgba(0,0,0,0.45)',
        glow: '0 0 20px rgba(92, 124, 250, 0.28)',
    },
    transition: { fast: '0.15s ease', normal: '0.2s ease', slow: '0.3s ease' },
    radius: { small: '6px', medium: '8px', large: '12px', xlarge: '16px' },
};

const themes: Record<ThemeId, AppTheme> = {
    light: lightTheme,
    dark: darkTheme,
    grey: greyTheme,
};

export function getThemeById(id: ThemeId): AppTheme {
    return themes[id];
}

// ——— Thèmes personnalisés (générés à partir d'une couleur) ———

export type CustomThemeEntry = {
    id: string;
    name: string;
    baseColor: string;
    theme: AppTheme;
};

const CUSTOM_ID_PREFIX = 'custom_';

export function isBuiltInThemeId(id: string): id is ThemeId {
    return id === 'light' || id === 'dark' || id === 'grey';
}

/** Parse hex #rgb ou #rrggbb en [r, g, b] 0-255 */
function hexToRgb(hex: string): [number, number, number] | null {
    const m = hex.replace(/^#/, '').match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!m) return null;
    let s = m[1];
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    const n = parseInt(s, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('');
}

/** Mélange linéaire entre deux couleurs (t = 0 → c1, t = 1 → c2) */
function mixHex(c1: string, c2: string, t: number): string {
    const a = hexToRgb(c1);
    const b = hexToRgb(c2);
    if (!a || !b) return c1;
    return rgbToHex(
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t
    );
}

/** Assombrit une couleur (amount 0–1 = force du mélange avec noir) */
function darken(hex: string, amount: number): string {
    return mixHex(hex, '#000000', amount);
}

/** Génère un thème sombre à partir d'une couleur d'accent. */
export function buildThemeFromColor(baseColor: string): AppTheme {
    const accent = hexToRgb(baseColor) ? baseColor : '#4285f4';
    const accentHover = darken(accent, 0.15);
    const bgPrimary = mixHex(accent, '#0a0a0a', 0.92);
    const bgSecondary = mixHex(accent, '#1a1a1a', 0.88);
    const bgTertiary = mixHex(accent, '#252525', 0.85);
    const navBg = mixHex(accent, '#151515', 0.9);
    const borderP = mixHex(accent, '#3a3a3a', 0.7);
    const borderS = mixHex(accent, '#444444', 0.65);
    const borderL = mixHex(accent, '#505050', 0.6);
    const glowRgb = hexToRgb(accent);
    const glowCss = glowRgb
        ? `0 0 20px rgba(${glowRgb[0]}, ${glowRgb[1]}, ${glowRgb[2]}, 0.35)`
        : '0 0 20px rgba(66, 133, 244, 0.3)';

    return {
        background: { primary: bgPrimary, secondary: bgSecondary, tertiary: bgTertiary, nav: navBg },
        text: {
            primary: '#ffffff',
            secondary: '#d1d1d1',
            tertiary: '#a8a8a8',
            disabled: '#888888',
        },
        accent: {
            blue: accent,
            blueHover: accentHover,
            green: '#34a853',
            greenHover: '#2d8a47',
            red: '#ea4335',
            redHover: '#d33b2c',
            orange: '#ff9800',
            purple: '#9c27b0',
        },
        border: { primary: borderP, secondary: borderS, light: borderL },
        surface: {
            info: mixHex(accent, '#1a2a3a', 0.6),
            success: '#1a2a1a',
            warning: '#3a2525',
            error: '#3a1a1a',
        },
        shadow: {
            small: '0 2px 8px rgba(0,0,0,0.4)',
            medium: '0 4px 16px rgba(0,0,0,0.5)',
            large: '0 8px 32px rgba(0,0,0,0.6)',
            glow: glowCss,
        },
        transition: { fast: '0.15s ease', normal: '0.2s ease', slow: '0.3s ease' },
        radius: { small: '6px', medium: '8px', large: '12px', xlarge: '16px' },
    };
}

export function createCustomThemeId(): string {
    return CUSTOM_ID_PREFIX + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
