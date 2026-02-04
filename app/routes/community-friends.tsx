import React from 'react';
import { translations } from '~/utils/i18n';
import { CommunitySubPage } from '~/components/community/CommunitySubPage';

export function meta() {
    return [{ title: translations.fr.meta.pageTitleCommunityFriends }];
}

export default function CommunityFriendsRoute() {
    return (
        <CommunitySubPage
            titleKey="community.sectionFriendsTitle"
            subtitleKey="community.sectionFriendsSubtitle"
            descriptionKey="community.sectionFriendsDescription"
            icon="👥"
        />
    );
}
