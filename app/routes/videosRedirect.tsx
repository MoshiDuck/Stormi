// INFO : app/routes/videosRedirect.tsx
// Redirection de /videos vers /films (aria-live pour a11y)

import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '~/contexts/LanguageContext';

export default function VideosRedirect() {
    const navigate = useNavigate();
    const { t } = useLanguage();

    useEffect(() => {
        navigate('/films', { replace: true });
    }, [navigate]);

    return (
        <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            style={{
                position: 'absolute',
                width: 1,
                height: 1,
                padding: 0,
                margin: -1,
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                border: 0,
            }}
        >
            {t('videos.redirectToFilms')}
        </div>
    );
}
