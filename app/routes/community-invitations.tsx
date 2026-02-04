import React from 'react';
import { translations } from '~/utils/i18n';
import { CommunitySubPage } from '~/components/community/CommunitySubPage';

export function meta() {
    return [{ title: translations.fr.meta.pageTitleCommunityInvitations }];
}

export default function CommunityInvitationsRoute() {
    return (
        <CommunitySubPage
            titleKey="community.sectionInvitationsTitle"
            subtitleKey="community.sectionInvitationsSubtitle"
            descriptionKey="community.sectionInvitationsDescription"
            icon="✉️"
        />
    );
}
