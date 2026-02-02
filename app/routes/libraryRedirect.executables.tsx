// INFO : app/routes/libraryRedirect.executables.tsx — redirection /executables → /library?tab=executables
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function ExecutablesRedirect() {
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/library?tab=executables', { replace: true });
    }, [navigate]);
    return null;
}
