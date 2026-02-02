// INFO : app/routes/libraryRedirect.images.tsx — redirection /images → /library?tab=images
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function ImagesRedirect() {
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/library?tab=images', { replace: true });
    }, [navigate]);
    return null;
}
