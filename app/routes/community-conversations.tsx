import React from 'react';
import { translations } from '~/utils/i18n';
import { CommunitySubPage } from '~/components/community/CommunitySubPage';

export function meta() {
    return [{ title: translations.fr.meta.pageTitleCommunityConversations }];
}

export default function CommunityConversationsRoute() {
    return (
        <CommunitySubPage
            titleKey="community.sectionConversationsTitle"
            subtitleKey="community.sectionConversationsSubtitle"
            descriptionKey="community.sectionConversationsDescription"
            icon="💬"
        />
    );
}
