// INFO : app/routes/index.tsx
// Affiche le splash directement sur / pour éviter fenêtre noire (pas de lazy load vers /splash).
import React from 'react';
import { SplashScreen } from '~/components/ui/SplashScreen';

export default function IndexRoute() {
    return <SplashScreen />;
}