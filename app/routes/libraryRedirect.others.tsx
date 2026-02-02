// INFO : app/routes/libraryRedirect.others.tsx — redirection /others → /library?tab=others
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function OthersRedirect() {
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/library?tab=others', { replace: true });
    }, [navigate]);
    return null;
}
