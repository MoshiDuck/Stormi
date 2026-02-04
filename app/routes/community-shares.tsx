import React from 'react';
import { translations } from '~/utils/i18n';
import { CommunitySubPage } from '~/components/community/CommunitySubPage';

export function meta() {
    return [{ title: translations.fr.meta.pageTitleCommunityShares }];
}

export default function CommunitySharesRoute() {
    return (
        <CommunitySubPage
            titleKey="community.sectionSharesTitle"
            subtitleKey="community.sectionSharesSubtitle"
            descriptionKey="community.sectionSharesDescription"
            icon="📁"
        />
    );
}
