// INFO : app/routes/libraryRedirect.archives.tsx — redirection /archives → /library?tab=archives
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function ArchivesRedirect() {
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/library?tab=archives', { replace: true });
    }, [navigate]);
    return null;
}
