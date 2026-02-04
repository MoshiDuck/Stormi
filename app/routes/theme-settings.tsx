// INFO : Page Apparence — thèmes principaux (light, dark, grey) + thèmes personnalisés (couleur → thème, max 10).
import React, { useState } from 'react';
import { Link } from 'react-router';
import { useTheme } from '~/contexts/ThemeContext';
import { useLanguage } from '~/contexts/LanguageContext';
import { translations, replacePlaceholders } from '~/utils/i18n';
import type { ThemeId } from '~/utils/ui/theme';
import { isBuiltInThemeId } from '~/utils/ui/theme';
import { ConfirmDialog } from '~/components/ui/ConfirmDialog';
import { Trash2 } from 'lucide-react';

export function meta() {
    return [
        { title: translations.fr.meta.pageTitleThemeSettings },
        { name: 'description', content: translations.fr.meta.pageDescriptionManageProfile },
    ];
}

const THEME_OPTIONS: { id: ThemeId; labelKey: keyof typeof translations.fr.theme; previewBg: string }[] = [
    { id: 'light', labelKey: 'light', previewBg: '#f5f5f5' },
    { id: 'dark', labelKey: 'dark', previewBg: '#0a0a0a' },
    { id: 'grey', labelKey: 'grey', previewBg: '#2d2d2d' },
];

const DEFAULT_CUSTOM_COLOR = '#4285f4';

export default function ThemeSettingsRoute() {
    const { themeId, setThemeId, theme, customThemes, addCustomTheme, removeCustomTheme } = useTheme();
    const { t } = useLanguage();
    const [savedFeedback, setSavedFeedback] = useState(false);
    const [customName, setCustomName] = useState('');
    const [customColor, setCustomColor] = useState(DEFAULT_CUSTOM_COLOR);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    const handleSelectBuiltIn = (id: ThemeId) => {
        setThemeId(id);
        setSavedFeedback(true);
        window.setTimeout(() => setSavedFeedback(false), 2000);
    };

    const handleAddCustom = () => {
        const id = addCustomTheme(customName || t('theme.themeNamePlaceholder'), customColor);
        if (id) {
            setThemeId(id);
            setCustomName('');
            setCustomColor(DEFAULT_CUSTOM_COLOR);
            setSavedFeedback(true);
            window.setTimeout(() => setSavedFeedback(false), 2000);
        }
    };

    const handleApplyCustom = (id: string) => {
        setThemeId(id);
        setSavedFeedback(true);
        window.setTimeout(() => setSavedFeedback(false), 2000);
    };

    const handleConfirmDelete = (id: string) => {
        removeCustomTheme(id);
        setDeleteTargetId(null);
    };

    const atMaxCustom = customThemes.length >= 10;

    return (
        <div
            style={{
                backgroundColor: theme.background.secondary,
                borderRadius: '12px',
                padding: '40px',
                boxShadow: theme.shadow.medium,
            }}
        >
            <div style={{ marginBottom: '24px' }}>
                <Link
                    to="/manage-profile"
                    prefetch="intent"
                    style={{
                        color: theme.accent.blue,
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: 500,
                        marginBottom: '16px',
                        display: 'inline-block',
                    }}
                >
                    ← {t('theme.backToManageProfile')}
                </Link>
            </div>

            <div style={{ marginBottom: '40px' }}>
                <h1
                    style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        marginBottom: '8px',
                        color: theme.text.primary,
                    }}
                >
                    {t('theme.title')}
                </h1>
                <p style={{ color: theme.text.secondary, fontSize: '16px' }}>{t('theme.subtitle')}</p>
            </div>

            {/* Thèmes principaux */}
            <section
                style={{
                    backgroundColor: theme.background.tertiary,
                    borderRadius: '8px',
                    padding: '30px',
                    border: `1px solid ${theme.border.primary}`,
                    marginBottom: '24px',
                }}
            >
                <h2
                    style={{
                        fontSize: '20px',
                        fontWeight: 600,
                        marginBottom: '20px',
                        color: theme.text.primary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                    }}
                >
                    <span
                        style={{
                            display: 'inline-block',
                            width: '24px',
                            height: '24px',
                            backgroundColor: theme.accent.blue,
                            borderRadius: '4px',
                            color: theme.text.primary,
                            textAlign: 'center',
                            lineHeight: '24px',
                            fontSize: '14px',
                        }}
                    >
                        🎨
                    </span>
                    {t('theme.appearance')}
                </h2>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: '16px',
                    }}
                >
                    {THEME_OPTIONS.map((opt) => {
                        const isSelected = isBuiltInThemeId(themeId) && themeId === opt.id;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleSelectBuiltIn(opt.id)}
                                style={{
                                    padding: '20px',
                                    borderRadius: '8px',
                                    border: `2px solid ${isSelected ? theme.accent.blue : theme.border.primary}`,
                                    backgroundColor: theme.background.secondary,
                                    color: theme.text.primary,
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: 500,
                                    transition: theme.transition.normal,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '12px',
                                    boxShadow: isSelected ? theme.shadow.glow : undefined,
                                }}
                                onMouseOver={(e) => {
                                    if (!isSelected) {
                                        e.currentTarget.style.borderColor = theme.border.light;
                                        e.currentTarget.style.boxShadow = theme.shadow.small;
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!isSelected) {
                                        e.currentTarget.style.borderColor = theme.border.primary;
                                        e.currentTarget.style.boxShadow = 'none';
                                    }
                                }}
                            >
                                <span
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '50%',
                                        backgroundColor: opt.previewBg,
                                        border: `2px solid ${theme.border.secondary}`,
                                    }}
                                />
                                <span>{t(`theme.${opt.labelKey}`)}</span>
                            </button>
                        );
                    })}
                </div>
                {savedFeedback && isBuiltInThemeId(themeId) && (
                    <p
                        style={{
                            marginTop: '16px',
                            fontSize: '14px',
                            color: theme.accent.green,
                            fontWeight: 500,
                        }}
                    >
                        {t('theme.saved')}
                    </p>
                )}
            </section>

            {/* Thèmes personnalisés */}
            <section
                style={{
                    backgroundColor: theme.background.tertiary,
                    borderRadius: '8px',
                    padding: '30px',
                    border: `1px solid ${theme.border.primary}`,
                }}
            >
                <h2
                    style={{
                        fontSize: '20px',
                        fontWeight: 600,
                        marginBottom: '16px',
                        color: theme.text.primary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                    }}
                >
                    <span
                        style={{
                            display: 'inline-block',
                            width: '24px',
                            height: '24px',
                            backgroundColor: theme.accent.purple,
                            borderRadius: '4px',
                            color: theme.text.primary,
                            textAlign: 'center',
                            lineHeight: '24px',
                            fontSize: '14px',
                        }}
                    >
                        ✨
                    </span>
                    {t('theme.customThemes')}
                </h2>
                <p style={{ color: theme.text.secondary, fontSize: '14px', marginBottom: '20px' }}>
                    {t('theme.color')} → {t('theme.appearance')}. {customThemes.length}/10.
                </p>

                {/* Créer un thème */}
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        alignItems: 'flex-end',
                        marginBottom: '24px',
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 500, color: theme.text.secondary }}>
                            {t('theme.themeName')}
                        </label>
                        <input
                            type="text"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder={t('theme.themeNamePlaceholder')}
                            maxLength={40}
                            style={{
                                padding: '10px 14px',
                                borderRadius: theme.radius.medium,
                                border: `1px solid ${theme.border.primary}`,
                                backgroundColor: theme.background.secondary,
                                color: theme.text.primary,
                                fontSize: '16px',
                                minWidth: 160,
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 500, color: theme.text.secondary }}>
                            {t('theme.color')}
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                                type="color"
                                value={customColor}
                                onChange={(e) => setCustomColor(e.target.value)}
                                style={{
                                    width: 44,
                                    height: 44,
                                    padding: 0,
                                    border: `2px solid ${theme.border.primary}`,
                                    borderRadius: theme.radius.medium,
                                    cursor: 'pointer',
                                    backgroundColor: 'transparent',
                                }}
                            />
                            <span
                                style={{
                                    fontSize: '14px',
                                    color: theme.text.tertiary,
                                    fontFamily: 'monospace',
                                }}
                            >
                                {customColor}
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleAddCustom}
                        disabled={atMaxCustom}
                        style={{
                            padding: '12px 20px',
                            backgroundColor: atMaxCustom ? theme.text.disabled : theme.accent.purple,
                            color: theme.text.primary,
                            border: 'none',
                            borderRadius: theme.radius.medium,
                            fontSize: '16px',
                            fontWeight: 500,
                            cursor: atMaxCustom ? 'not-allowed' : 'pointer',
                            transition: theme.transition.normal,
                            opacity: atMaxCustom ? 0.7 : 1,
                        }}
                    >
                        {t('theme.addCustom')}
                    </button>
                </div>
                {atMaxCustom && (
                    <p style={{ fontSize: '13px', color: theme.accent.orange, marginBottom: '16px' }}>
                        {t('theme.maxReached')}
                    </p>
                )}

                {/* Liste des thèmes personnalisés */}
                {customThemes.length > 0 && (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {customThemes.map((ct) => {
                            const isSelected = themeId === ct.id;
                            return (
                                <li
                                    key={ct.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        backgroundColor: theme.background.secondary,
                                        borderRadius: theme.radius.medium,
                                        border: `1px solid ${isSelected ? theme.accent.blue : theme.border.primary}`,
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            backgroundColor: ct.baseColor,
                                            border: `2px solid ${theme.border.secondary}`,
                                            flexShrink: 0,
                                        }}
                                    />
                                    <span
                                        style={{
                                            flex: 1,
                                            color: theme.text.primary,
                                            fontSize: '15px',
                                            fontWeight: 500,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {ct.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleApplyCustom(ct.id)}
                                        style={{
                                            padding: '8px 14px',
                                            backgroundColor: isSelected ? theme.accent.blue : theme.background.tertiary,
                                            color: theme.text.primary,
                                            border: `1px solid ${theme.border.primary}`,
                                            borderRadius: theme.radius.small,
                                            fontSize: '14px',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            transition: theme.transition.fast,
                                        }}
                                    >
                                        {t('theme.apply')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeleteTargetId(ct.id)}
                                        aria-label={t('theme.delete')}
                                        style={{
                                            padding: '8px',
                                            backgroundColor: 'transparent',
                                            color: theme.accent.red,
                                            border: 'none',
                                            borderRadius: theme.radius.small,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Trash2 size={18} strokeWidth={2} />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
                {savedFeedback && !isBuiltInThemeId(themeId) && (
                    <p
                        style={{
                            marginTop: '16px',
                            fontSize: '14px',
                            color: theme.accent.green,
                            fontWeight: 500,
                        }}
                    >
                        {t('theme.saved')}
                    </p>
                )}
            </section>

            <ConfirmDialog
                isOpen={deleteTargetId !== null}
                title={t('theme.delete')}
                message={
                    deleteTargetId
                        ? replacePlaceholders(t('theme.deleteConfirm'), {
                              name: customThemes.find((c) => c.id === deleteTargetId)?.name ?? '',
                          })
                        : ''
                }
                confirmText={t('theme.delete')}
                cancelText={t('common.cancel')}
                confirmColor={theme.accent.red}
                onConfirm={() => deleteTargetId && handleConfirmDelete(deleteTargetId)}
                onCancel={() => setDeleteTargetId(null)}
            />
        </div>
    );
}
