// Page Statistiques (contenu ex-accueil) : stats, continuer à regarder, récemment ajoutés. Accessible depuis le menu Profil.
import React from 'react';
import HomeRoute from './home';

export { clientLoader } from './home';

export function meta() {
    return [
        { title: 'Statistiques | Stormi' },
        { name: 'description', content: 'Vos statistiques, continuer à regarder et récemment ajoutés.' },
    ];
}

export default function StatisticsRoute() {
    return <HomeRoute />;
}
