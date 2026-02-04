import React from 'react';
import { translations } from '~/utils/i18n';
import { CommunitySubPage } from '~/components/community/CommunitySubPage';

export function meta() {
    return [{ title: translations.fr.meta.pageTitleCommunityFamily }];
}

export default function CommunityFamilyRoute() {
    return (
        <CommunitySubPage
            titleKey="community.sectionFamilyTitle"
            subtitleKey="community.sectionFamilySubtitle"
            descriptionKey="community.sectionFamilyDescription"
            icon="👨‍👩‍👧"
        />
    );
}
