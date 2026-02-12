// Redirection /home → /films (plus de page accueil ; atterrissage sur Regarder).
import React from 'react';
import { Navigate } from 'react-router';

export default function HomeRedirect() {
    return <Navigate to="/films" replace />;
}
