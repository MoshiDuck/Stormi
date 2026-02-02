// INFO : app/routes/libraryRedirect.documents.tsx — redirection /documents → /library?tab=documents
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function DocumentsRedirect() {
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/library?tab=documents', { replace: true });
    }, [navigate]);
    return null;
}
