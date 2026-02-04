import React from 'react';
import { translations } from '~/utils/i18n';
import { CommunitySubPage } from '~/components/community/CommunitySubPage';

export function meta() {
    return [{ title: translations.fr.meta.pageTitleCommunityActivity }];
}

export default function CommunityActivityRoute() {
    return (
        <CommunitySubPage
            titleKey="community.sectionActivityTitle"
            subtitleKey="community.sectionActivitySubtitle"
            descriptionKey="community.sectionActivityDescription"
            icon="🔄"
        />
    );
}
