// INFO : app/utils/i18n.ts
// Système de traduction multilingue

export type Language = 'fr' | 'en' | 'es' | 'de';

export interface Translations {
    // Navigation
    nav: {
        home: string;
        upload: string;
        add: string;
        files: string;
        watch: string;
        listen: string;
        library: string;
        community: string;
        localPlayer: string;
        profile: string;
        logout: string;
        /** Labels accessibles pour lecteurs d'écran (WCAG 2.4.4) */
        homeAriaLabel: string;
        communityAriaLabel: string;
        addAriaLabel: string;
        watchAriaLabel: string;
        listenAriaLabel: string;
        libraryAriaLabel: string;
        localPlayerAriaLabel: string;
        profileAriaLabel: string;
        menuOpenAriaLabel: string;
        menuCloseAriaLabel: string;
    };
    // Lecteur local (page dédiée)
    localPlayer: {
        title: string;
        subtitle: string;
        dropZone: string;
        dropZoneOr: string;
        browse: string;
        play: string;
        remove: string;
        emptyState: string;
        emptyStateHint: string;
        acceptedFormats: string;
        playlistCount: string;
    };
    // Common
    common: {
        loading: string;
        error: string;
        success: string;
        cancel: string;
        confirm: string;
        retry: string;
        delete: string;
        save: string;
        close: string;
        open: string;
        untitled: string;
        user: string;
        yes: string;
        no: string;
        unnamed: string;
        imageFallback: string;
        progression: string;
        later: string;
        cancelWithCountdown: string;
    };
    // Splash & redirection
    splash: {
        loadingLong: string;
        loading: string;
        redirecting: string;
        connecting: string;
        ariaLabel: string;
    };
    // Titres de page (meta)
    meta: {
        pageTitleHome: string;
        pageTitleNotFound: string;
        pageTitleMusics: string;
        pageTitleUpload: string;
        pageTitleLibrary: string;
        pageTitleProfile: string;
        pageTitleManageProfile: string;
        pageTitleThemeSettings: string;
        pageTitleLanguageSettings: string;
        pageTitleHelp: string;
        pageTitleCommunity: string;
        pageDescriptionHome: string;
        pageDescriptionCommunity: string;
        pageDescriptionProfile: string;
        pageDescriptionLibrary: string;
        pageDescriptionManageProfile: string;
        pageDescriptionLanguageSettings: string;
        pageDescriptionHelp: string;
    };
    // Actions médias (Lecture, Plus d'infos, etc.)
    media: {
        play: string;
        moreInfo: string;
        addToList: string;
    };
    // Musiques (Artiste, Album, Titre, etc.)
    musics: {
        artist: string;
        album: string;
        title: string;
        unknownArtist: string;
        unknownAlbum: string;
        toIdentify: string;
        duration: string;
        action: string;
        albums: string;
        playAll: string;
        uploadMusicHint: string;
        trackCount: string;
        trackCountPlural: string;
        yourArtists: string;
    };
    // Login
    login: {
        title: string;
        subtitle: string;
        connectWithGoogle: string;
        electronMode: string;
        terms: string;
        configError: string;
        configUnavailable: string;
        googleAuthError: string;
        configErrorDetail: string;
    };
    // Home
    home: {
        title: string;
        welcome: string;
        stats: string;
        statsDescription: string;
        fileCount: string;
        totalSize: string;
        billing: string;
        billingDescription: string;
        amountToPay: string;
        monthlyBilling: string;
        for: string;
        rate: string;
        emptyTitle: string;
        emptyDescription: string;
        uploadFirst: string;
        continueWatching: string;
        recentlyAdded: string;
        showStats: string;
        hideStats: string;
        spaceVideos: string;
        spaceMusics: string;
        spaceLibrary: string;
        spaceAdd: string;
        seeAllVideos: string;
        seeAllMusics: string;
        addMore: string;
        emptyHint: string;
    };
    // Upload
    upload: {
        title: string;
        selectFile: string;
        dragDrop: string;
        dragDropOr?: string;
        supportedFormats?: string;
        globalProgress: string;
        filesCompleted: string;
        inProgress: string;
        totalSpeed: string;
        timeRemaining: string;
        uploaded: string;
        showDetails: string;
        hideDetails: string;
        pause: string;
        resume: string;
        cancel: string;
        completed: string;
        error: string;
        noUploads: string;
        status: string;
        size: string;
        speed: string;
        remainingTime: string;
        successMessage: string;
        nextStep: string;
        viewHome: string;
        viewLibrary: string;
        addAnother: string;
        nextStepHint: string;
        uploadButton: string;
        filesWillAppearHere: string;
        fileUploaded: string;
        filesUploaded: string;
        fast: string;
        fastDescription: string;
        secure: string;
        secureDescription: string;
        cloudflareStorage: string;
        cloudflareStorageDescription: string;
        spaceUsed: string;
        unlimited: string;
    };
    // Local player (meta)
    localPlayerMeta: {
        pageTitle: string;
        pageDescription: string;
    };
    // Footer
    footer: {
        allRightsReserved: string;
    };
    // Page 404
    notFound: {
        title: string;
        description: string;
        backHome: string;
        addFiles: string;
    };
    // Categories (labels + tooltips pour la barre de catégories)
    categories: {
        videos: string;
        musics: string;
        images: string;
        documents: string;
        archives: string;
        executables: string;
        others: string;
        videosHint?: string;
        musicsHint?: string;
        imagesHint?: string;
        documentsHint?: string;
        archivesHint?: string;
        executablesHint?: string;
        othersHint?: string;
    };
    // Videos page (Films & Séries)
    videos: {
        films: string;
        series: string;
        unidentifiedFiles: string;
        myVideos: string;
        myFilms: string;
        mySeries: string;
        clickToIdentify: string;
        tvShows: string;
        collections: string;
        film: string;
        season: string;
        episode: string;
        recentlyAdded: string;
        redirectToFilms: string;
        top10: string;
    };
    // Empty states
    emptyStates: {
        noVideos: string;
        noVideosDescription: string;
        uploadFirstVideo: string;
        noFilms: string;
        noFilmsDescription: string;
        uploadFirstFilm: string;
        noSeries: string;
        noSeriesDescription: string;
        uploadFirstSeries: string;
        noMusics: string;
        noMusicsDescription: string;
        uploadFirstMusic: string;
        noImages: string;
        noImagesDescription: string;
        uploadFirstImage: string;
        noDocuments: string;
        noDocumentsDescription: string;
        uploadFirstDocument: string;
        noArchives: string;
        noArchivesDescription: string;
        uploadFirstArchive: string;
        noExecutables: string;
        noExecutablesDescription: string;
        uploadFirstExecutable: string;
        noOthers: string;
        noOthersDescription: string;
        uploadFile: string;
    };
    // Profile
    profile: {
        title: string;
        subtitle: string;
        language: string;
        languageDescription: string;
        emailVerified: string;
        emailNotVerified: string;
        personalInfo: string;
        fullName: string;
        notSpecified: string;
        emailLabel: string;
        verificationStatus: string;
        userId: string;
        idLabel: string;
        emailVerifiedLabel: string;
        connectedAccount: string;
        googleAccount: string;
        connectedViaGoogle: string;
        accountSecureHint: string;
        actions: string;
        logout: string;
        clearLocalData: string;
        confirmClearLocalData: string;
        logoutNote: string;
        noteLabel: string;
    };
    // Profile dropdown (menu au survol)
    profileMenu: {
        manageProfile: string;
        account: string;
        helpCenter: string;
    };
    // Manage profile page (langue, déconnexion, données locales)
    manageProfile: {
        title: string;
        subtitle: string;
        backToAccount: string;
    };
    // Theme settings page
    theme: {
        title: string;
        subtitle: string;
        appearance: string;
        light: string;
        dark: string;
        grey: string;
        saved: string;
        backToManageProfile: string;
        customThemes: string;
        addCustom: string;
        themeName: string;
        themeNamePlaceholder: string;
        color: string;
        maxReached: string;
        delete: string;
        deleteConfirm: string;
        apply: string;
        customThemeDeleted: string;
    };
    // Community page
    community: {
        title: string;
        subtitle: string;
        comingSoon: string;
        description: string;
    };
    // Help center page
    help: {
        title: string;
        subtitle: string;
        faqTitle: string;
        faqUpload: string;
        faqUploadAnswer: string;
        faqStorage: string;
        faqStorageAnswer: string;
        contactTitle: string;
        contactText: string;
    };
    // Dialogs
    dialogs: {
        logoutTitle: string;
        logoutMessage: string;
    };
    // Match (identification médias)
    match: {
        loadingInfo: string;
        titleDetected: string;
        artistDetected: string;
        artistDetectedInMetadata: string;
        fileLabel: string;
        identifyTrack: string;
        identifyMovie: string;
        step1Artist: string;
        step2Title: string;
        searchArtistTitle: string;
        artistPlaceholder: string;
        searchButton: string;
        searching: string;
        selectedArtistLabel: string;
        songTitlePlaceholder: string;
        loadingAlbums: string;
        viewAllAlbums: string;
        searchMovieOrShow: string;
        fileNotFound: string;
        searchArtistsError: string;
        searchAlbumsError: string;
        loadAlbumsError: string;
        searchMoviesError: string;
        pleaseEnterTitle: string;
        pleaseSelectArtist: string;
        pleaseSelectMovie: string;
        allAlbumsBy: string;
        albumsContaining: string;
        movieOrShowPlaceholder: string;
        selectArtist: string;
        selectMatch: string;
        selectAlbum: string;
        deselectAlbum: string;
        step4Confirm: string;
        confirmSelection: string;
        saving: string;
        cancelAndReturn: string;
        titleFallback: string;
    };
    // Player (MiniPlayer, reader)
    player: {
        dismissRestore: string;
        resumePlayback: string;
        previousTrack: string;
        nextTrack: string;
        pause: string;
        play: string;
        closePlayer: string;
        miniPlayer: string;
    };
    // Carousel
    carousel: {
        scrollLeft: string;
        scrollRight: string;
    };
    // Actions / aria (View, Open, Identify, etc.)
    actions: {
        select: string;
        deselect: string;
        view: string;
        open: string;
        identify: string;
        backToList: string;
        viewAlbumsBy: string;
        viewTracksOf: string;
        playTrack: string;
        identifyTrack: string;
        viewImage: string;
        thisImage: string;
        thisFile: string;
        thisDocument: string;
        thisArchive: string;
        thisExecutable: string;
        thisMovie: string;
        thisShow: string;
        playMovie: string;
        playSeries: string;
        playEpisode: string;
    };
    // Info page (Ma liste)
    info: {
        myList: string;
    };
    // Viewer (images preview)
    viewer: {
        previewImage: string;
        closePreview: string;
    };
    // Loading
    loading: {
        pageLoad: string;
    };
    // Toast
    toast: {
        closeHint: string;
        close: string;
    };
    // Rating
    rating: {
        rateStars: string;
        rateStarsPlural: string;
        clickToRate: string;
        yourRating: string;
        averageRating: string;
    };
    // PDF
    pdf: {
        previewUnavailable: string;
    };
    // Language selector & language settings page
    language: {
        selectLanguage: string;
        title: string;
        subtitle: string;
        backToManageProfile: string;
    };
    // Errors
    errors: {
        fetchFailed: string;
        unknown: string;
        networkError: string;
        statsLoadFailed: string;
        authFailed: string;
        saveFailed: string;
        deleteFailed: string;
        loadFailed: string;
        title: string;
        retry: string;
        fetchFilesFailed: string;
        errorWithStatus: string;
        saveFailedTryAgain: string;
    };
}

const translations: Record<Language, Translations> = {
    fr: {
        nav: {
            home: 'Accueil',
            upload: 'Upload',
            add: 'Ajouter',
            files: 'Fichiers',
            watch: 'Regarder',
            listen: 'Écouter',
            library: 'Bibliothèque',
            community: 'Communauté',
            localPlayer: 'Lecteur local',
            profile: 'Profil',
            logout: 'Déconnexion',
            homeAriaLabel: 'Page d\'accueil Stormi',
            addAriaLabel: 'Ajouter des médias',
            watchAriaLabel: 'Films et séries',
            listenAriaLabel: 'Musiques',
            libraryAriaLabel: 'Images, documents et archives',
            communityAriaLabel: 'Espace communauté Stormi',
            localPlayerAriaLabel: 'Lire des fichiers locaux sans upload',
            profileAriaLabel: 'Mon compte et paramètres',
            menuOpenAriaLabel: 'Ouvrir le menu de navigation',
            menuCloseAriaLabel: 'Fermer le menu de navigation'
        },
        localPlayer: {
            title: 'Lecteur local',
            subtitle: 'Ajoutez des fichiers audio ou vidéo depuis votre appareil pour les lire en lecture continue.',
            dropZone: 'Glissez-déposez vos fichiers ici',
            dropZoneOr: 'ou',
            browse: 'Parcourir',
            play: 'Lancer la lecture',
            remove: 'Retirer',
            emptyState: 'Aucun fichier sélectionné',
            emptyStateHint: 'Ajoutez des pistes audio ou vidéo pour constituer une playlist.',
            acceptedFormats: 'Audio et vidéo (MP3, WAV, MP4, WebM, etc.)',
            playlistCount: 'Playlist ({count} fichier(s))'
        },
        common: {
            loading: 'Chargement en cours...',
            error: 'Erreur',
            success: 'Succès',
            cancel: 'Annuler',
            confirm: 'Confirmer',
            retry: 'Réessayer',
            delete: 'Supprimer',
            save: 'Enregistrer',
            close: 'Fermer',
            open: 'Ouvrir',
            untitled: 'Sans titre',
            user: 'Utilisateur',
            yes: 'Oui',
            no: 'Non',
            unnamed: 'Sans nom',
            imageFallback: 'Image',
            progression: 'Progression',
            later: 'Plus tard',
            cancelWithCountdown: 'Annuler ({seconds}s)'
        },
        splash: {
            loadingLong: 'Chargement prolongé. Vous pouvez réessayer.',
            loading: 'Chargement…',
            redirecting: 'Redirection…',
            connecting: 'Connexion…',
            ariaLabel: 'Écran de démarrage Stormi'
        },
        meta: {
            pageTitleHome: 'Accueil | Stormi',
            pageTitleNotFound: 'Page non trouvée | Stormi',
            pageTitleMusics: 'Musiques | Stormi',
            pageTitleUpload: 'Upload | Stormi',
            pageTitleLibrary: 'Bibliothèque | Stormi',
            pageTitleProfile: 'Profil | Stormi',
            pageTitleManageProfile: 'Gérer le profil | Stormi',
            pageTitleThemeSettings: 'Apparence | Stormi',
            pageTitleLanguageSettings: 'Langue | Stormi',
            pageTitleHelp: 'Centre d\'aide | Stormi',
            pageTitleCommunity: 'Communauté | Stormi',
            pageDescriptionHome: 'Votre espace personnel de stockage et streaming. Gérez vos fichiers, statistiques et accédez à vos médias.',
            pageDescriptionProfile: 'Gérez votre profil Stormi, langue et compte.',
            pageDescriptionLibrary: 'Vos images, documents, archives et fichiers. Gérez votre bibliothèque de fichiers.',
            pageDescriptionManageProfile: 'Langue, déconnexion et données locales.',
            pageDescriptionLanguageSettings: 'Choisissez la langue de l\'application.',
            pageDescriptionHelp: 'Questions fréquentes et support Stormi.',
            pageDescriptionCommunity: 'Espace communauté Stormi : partage et échanges entre utilisateurs.'
        },
        community: {
            title: 'Communauté',
            subtitle: 'Espace d\'échange et de partage entre utilisateurs Stormi.',
            comingSoon: 'Bientôt disponible',
            description: 'Les fonctionnalités communautaires (discussions, partage de listes, recommandations) arrivent prochainement.'
        },
        media: {
            play: 'Lecture',
            moreInfo: 'Plus d\'infos',
            addToList: 'Ajouter à ma liste'
        },
        musics: {
            artist: 'Artiste',
            album: 'Album',
            title: 'Titre',
            unknownArtist: 'Artiste inconnu',
            unknownAlbum: 'Sans nom',
            toIdentify: 'À identifier',
            duration: 'Durée',
            action: 'Action',
            albums: 'Albums',
            playAll: 'Tout lire',
            uploadMusicHint: 'Uploadez des fichiers musicaux pour commencer',
            trackCount: 'titre',
            trackCountPlural: 'titres',
            yourArtists: 'Vos artistes'
        },
        match: {
            loadingInfo: 'Chargement des informations...',
            titleDetected: 'Titre détecté dans les métadonnées',
            artistDetected: 'Artiste détecté',
            artistDetectedInMetadata: 'Artiste détecté dans les métadonnées',
            fileLabel: 'Fichier',
            identifyTrack: 'Identifier ce morceau',
            identifyMovie: 'Identifier ce film/série',
            step1Artist: 'Choisir l\'artiste',
            step2Title: 'Entrer le titre',
            searchArtistTitle: 'Rechercher l\'artiste',
            artistPlaceholder: 'Nom de l\'artiste...',
            searchButton: 'Rechercher',
            searching: 'Recherche...',
            selectedArtistLabel: 'Artiste sélectionné',
            songTitlePlaceholder: 'Titre de la chanson...',
            loadingAlbums: 'Chargement des albums...',
            viewAllAlbums: 'Voir tous les albums de',
            searchMovieOrShow: 'Rechercher un film ou une série',
            fileNotFound: 'Fichier non trouvé',
            searchArtistsError: 'Impossible de rechercher les artistes. Vérifiez votre connexion ou réessayez.',
            searchAlbumsError: 'Impossible de rechercher les albums. Vérifiez votre connexion ou réessayez.',
            loadAlbumsError: 'Impossible de charger les albums. Vérifiez votre connexion ou réessayez.',
            searchMoviesError: 'Impossible de rechercher les films/séries. Vérifiez votre connexion ou réessayez.',
            pleaseEnterTitle: 'Veuillez entrer un titre',
            pleaseSelectArtist: 'Veuillez sélectionner un artiste',
            pleaseSelectMovie: 'Veuillez sélectionner un film ou une série',
            allAlbumsBy: 'Tous les albums de',
            albumsContaining: 'Albums contenant',
            movieOrShowPlaceholder: 'Titre du film ou de la série...',
            selectArtist: 'Sélectionner',
            selectMatch: 'Sélectionner',
            selectAlbum: 'Sélectionner',
            deselectAlbum: 'Désélectionner',
            step4Confirm: '4. Confirmer',
            confirmSelection: 'Confirmer la sélection',
            saving: 'Sauvegarde...',
            cancelAndReturn: 'Annuler et retourner aux fichiers',
            titleFallback: 'Titre'
        },
        player: {
            dismissRestore: 'Ignorer la restauration',
            resumePlayback: 'Reprendre la lecture',
            previousTrack: 'Piste précédente',
            nextTrack: 'Piste suivante',
            pause: 'Mettre en pause',
            play: 'Lire',
            closePlayer: 'Fermer le lecteur',
            miniPlayer: 'Mini lecteur'
        },
        carousel: {
            scrollLeft: 'Défiler vers la gauche',
            scrollRight: 'Défiler vers la droite'
        },
        actions: {
            select: 'Sélectionner',
            deselect: 'Désélectionner',
            view: 'Voir',
            open: 'Ouvrir',
            identify: 'Identifier',
            backToList: 'Retour à la liste',
            viewAlbumsBy: 'Voir les albums de',
            viewTracksOf: 'Voir les titres de',
            playTrack: 'Lire',
            identifyTrack: 'Identifier',
            viewImage: 'Prévisualisation de l\'image',
            thisImage: 'cette image',
            thisFile: 'ce fichier',
            thisDocument: 'ce document',
            thisArchive: 'cette archive',
            thisExecutable: 'cet exécutable',
            thisMovie: 'ce film',
            thisShow: 'cette série',
            playMovie: 'Lire le film',
            playSeries: 'Lire la série',
            playEpisode: 'Lire l\'épisode'
        },
        info: {
            myList: 'Ma liste'
        },
        viewer: {
            previewImage: 'Prévisualisation de l\'image',
            closePreview: 'Fermer la prévisualisation'
        },
        loading: {
            pageLoad: 'Chargement de la page'
        },
        toast: {
            closeHint: 'Cliquer ou appuyer sur Entrée pour fermer',
            close: 'Fermer la notification'
        },
        rating: {
            rateStars: 'Noter étoile',
            rateStarsPlural: 'Noter étoiles',
            clickToRate: 'Cliquez pour noter',
            yourRating: 'Votre note',
            averageRating: 'Note moyenne'
        },
        pdf: {
            previewUnavailable: 'Aperçu indisponible'
        },
        language: {
            selectLanguage: 'Sélectionner la langue',
            title: 'Langue',
            subtitle: 'Choisissez la langue de l\'application. Votre choix est enregistré pour ce compte.',
            backToManageProfile: 'Retour à Gérer le profil'
        },
        login: {
            title: 'Stormi',
            subtitle: 'Connectez-vous pour accéder à votre espace',
            connectWithGoogle: 'Se connecter avec Google :',
            electronMode: 'Mode Electron actif - L\'authentification s\'ouvrira dans une fenêtre Electron',
            terms: 'En vous connectant, vous acceptez nos conditions d\'utilisation et notre politique de confidentialité.',
            configError: 'Erreur de configuration',
            configUnavailable: 'Configuration non disponible. Veuillez réessayer plus tard.',
            googleAuthError: 'Erreur lors de l\'authentification Google',
            configErrorDetail: 'GOOGLE_CLIENT_ID non configuré côté Cloudflare. Veuillez configurer votre application.'
        },
        home: {
            title: 'Tableau de bord',
            welcome: 'Bienvenue sur votre espace personnel, {name}',
            stats: 'Statistiques',
            statsDescription: 'Vue d\'ensemble de votre activité',
            fileCount: 'Nombre de fichiers',
            totalSize: 'Go upload',
            billing: 'Montant à payer',
            billingDescription: 'Facturation mensuelle',
            amountToPay: 'Montant à payer',
            monthlyBilling: 'Facturation mensuelle',
            for: 'pour',
            rate: 'Tarif: 0,030 $/GB-mois (arrondi à la hausse)',
            emptyTitle: 'Bienvenue ! Ajoutez vos premiers médias',
            emptyDescription: 'Commencez par ajouter vos médias pour profiter de votre espace de stockage et streaming.',
            uploadFirst: 'Ajouter des médias',
            continueWatching: 'Continuer de regarder',
            recentlyAdded: 'Récemment ajoutés',
            showStats: 'Voir les stats',
            hideStats: 'Masquer les stats',
            spaceVideos: 'Vidéos',
            spaceMusics: 'Musiques',
            spaceLibrary: 'Bibliothèque',
            spaceAdd: 'Ajouter',
            seeAllVideos: 'Voir films & séries',
            seeAllMusics: 'Écouter ma musique',
            addMore: 'Ajouter encore',
            emptyHint: 'Vos fichiers apparaîtront dans ces espaces une fois ajoutés.'
        },
        upload: {
            title: 'Gestionnaire d\'upload',
            selectFile: 'Sélectionner un fichier',
            dragDrop: 'Glissez-déposez votre fichier ici',
            dragDropOr: 'ou cliquez pour parcourir vos fichiers',
            supportedFormats: 'Formats supportés: images, vidéos, documents (max 100MB)',
            globalProgress: 'Progression globale',
            filesCompleted: 'fichiers terminés',
            inProgress: 'en cours',
            totalSpeed: 'Vitesse totale',
            timeRemaining: 'Temps restant',
            uploaded: 'Uploadé',
            showDetails: 'Afficher les détails',
            hideDetails: 'Masquer les détails',
            pause: 'Pause',
            resume: 'Reprendre',
            cancel: 'Annuler',
            completed: 'Terminé',
            error: 'Erreur',
            noUploads: 'Aucun upload en cours',
            status: 'Statut',
            size: 'Taille',
            speed: 'Vitesse',
            remainingTime: 'Temps restant',
            successMessage: 'Fichier ajouté avec succès',
            nextStep: 'Prochaine étape',
            viewHome: 'Voir mon accueil',
            viewLibrary: 'Voir la bibliothèque',
            addAnother: 'Ajouter un autre fichier',
            nextStepHint: 'Où souhaitez-vous aller ?',
            uploadButton: 'Envoyer',
            filesWillAppearHere: 'Les fichiers que vous ajoutez apparaîtront ici',
            fileUploaded: 'fichier uploadé',
            filesUploaded: 'fichiers uploadés',
            fast: 'Rapide',
            fastDescription: 'Upload optimisé avec progression en temps réel',
            secure: 'Sécurisé',
            secureDescription: 'Tous les uploads sont authentifiés et protégés',
            cloudflareStorage: 'Stockage Cloudflare',
            cloudflareStorageDescription: 'Vos fichiers sont stockés sur R2 de Cloudflare',
            spaceUsed: 'Espace utilisé',
            unlimited: 'Illimité'
        },
        localPlayerMeta: {
            pageTitle: 'Lecteur local | Stormi',
            pageDescription: 'Lisez des fichiers audio et vidéo depuis votre appareil en lecture continue.'
        },
        footer: {
            allRightsReserved: 'Tous droits réservés'
        },
        notFound: {
            title: 'Page non trouvée',
            description: 'Cette page n\'existe pas ou a été déplacée.',
            backHome: 'Retour à l\'accueil',
            addFiles: 'Ajouter des fichiers'
        },
        videos: {
            films: 'Films',
            series: 'Séries',
            unidentifiedFiles: 'Fichiers à identifier',
            myVideos: 'Mes vidéos',
            myFilms: 'Mes films',
            mySeries: 'Mes séries',
            clickToIdentify: 'Cliquez pour identifier',
            tvShows: 'Séries TV',
            collections: 'Collections',
            film: 'film',
            season: 'saison',
            episode: 'Épisode',
            recentlyAdded: 'Ajoutés récemment',
            redirectToFilms: 'Redirection vers Films',
            top10: 'Top 10 - Les mieux notés'
        },
        categories: {
            videos: 'Vidéos',
            musics: 'Musiques',
            images: 'Images',
            documents: 'Documents',
            archives: 'Archives',
            executables: 'Exécutables',
            others: 'Autres fichiers',
            videosHint: 'Films, séries et vidéos',
            musicsHint: 'Pistes audio et albums',
            imagesHint: 'Photos et images',
            documentsHint: 'PDF et documents',
            archivesHint: 'ZIP, RAR et archives',
            executablesHint: 'Programmes et exécutables',
            othersHint: 'Autres types de fichiers'
        },
        emptyStates: {
            noVideos: 'Aucune vidéo',
            noVideosDescription: 'Commencez à construire votre bibliothèque de vidéos',
            uploadFirstVideo: '📤 Uploadez votre première vidéo',
            noFilms: 'Aucun film',
            noFilmsDescription: 'Uploadez vos films pour les ajouter à votre collection',
            uploadFirstFilm: '📤 Uploadez votre premier film',
            noSeries: 'Aucune série',
            noSeriesDescription: 'Uploadez vos épisodes de séries TV',
            uploadFirstSeries: '📤 Uploadez votre première série',
            noMusics: 'Aucune musique',
            noMusicsDescription: 'Commencez à construire votre bibliothèque musicale',
            uploadFirstMusic: '📤 Uploadez votre première musique',
            noImages: 'Aucune image',
            noImagesDescription: 'Commencez à construire votre galerie d\'images',
            uploadFirstImage: '📤 Uploadez votre première image',
            noDocuments: 'Aucun document',
            noDocumentsDescription: 'Commencez à organiser vos documents',
            uploadFirstDocument: '📤 Uploadez votre premier document',
            noArchives: 'Aucune archive',
            noArchivesDescription: 'Commencez à organiser vos fichiers d\'archive',
            uploadFirstArchive: '📤 Uploadez votre première archive',
            noExecutables: 'Aucun exécutable',
            noExecutablesDescription: 'Organisez vos fichiers exécutables',
            uploadFirstExecutable: '📤 Uploadez votre premier exécutable',
            noOthers: 'Aucun autre fichier',
            noOthersDescription: 'Les fichiers qui ne correspondent à aucune catégorie apparaîtront ici',
            uploadFile: '📤 Uploadez un fichier'
        },
        profile: {
            title: 'Mon Profil',
            subtitle: 'Gérez vos informations personnelles et vos préférences',
            language: 'Langue',
            languageDescription: 'Choisissez votre langue préférée',
            emailVerified: 'Email vérifié',
            emailNotVerified: 'Email non vérifié',
            personalInfo: 'Informations personnelles',
            fullName: 'Nom complet',
            notSpecified: 'Non spécifié',
            emailLabel: 'Email',
            verificationStatus: 'Statut de vérification',
            userId: 'ID utilisateur',
            idLabel: 'ID',
            emailVerifiedLabel: 'Email vérifié',
            connectedAccount: 'Compte connecté',
            googleAccount: 'Compte Google',
            connectedViaGoogle: 'Connecté via Google OAuth',
            accountSecureHint: 'Votre compte est sécurisé avec l\'authentification Google. Pour modifier vos informations, veuillez les mettre à jour directement sur votre compte Google.',
            actions: 'Actions',
            logout: 'Se déconnecter',
            clearLocalData: 'Effacer les données locales',
            confirmClearLocalData: 'Êtes-vous sûr de vouloir supprimer toutes vos données locales ?',
            logoutNote: 'La déconnexion supprimera votre session actuelle mais ne supprimera pas votre compte. Pour supprimer définitivement votre compte, veuillez vous rendre sur votre compte Google.',
            noteLabel: 'Note :'
        },
        profileMenu: {
            manageProfile: 'Gérer le profil',
            account: 'Compte',
            helpCenter: 'Centre d\'aide'
        },
        manageProfile: {
            title: 'Gérer le profil',
            subtitle: 'Langue, déconnexion et données locales.',
            backToAccount: 'Retour au compte'
        },
        theme: {
            title: 'Apparence',
            subtitle: 'Choisissez le thème de l\'application. Votre choix est enregistré pour ce compte.',
            appearance: 'Thème',
            light: 'Clair',
            dark: 'Sombre',
            grey: 'Gris',
            saved: 'Thème enregistré',
            backToManageProfile: 'Retour à Gérer le profil',
            customThemes: 'Thèmes personnalisés',
            addCustom: 'Ajouter un thème',
            themeName: 'Nom du thème',
            themeNamePlaceholder: 'Ex. Mon bleu',
            color: 'Couleur',
            maxReached: 'Maximum 10 thèmes personnalisés. Supprimez-en un pour en ajouter.',
            delete: 'Supprimer',
            deleteConfirm: 'Supprimer le thème « {name} » ?',
            apply: 'Appliquer',
            customThemeDeleted: 'Thème supprimé'
        },
        community: {
            title: 'Communauté',
            subtitle: 'Espace d\'échange et de partage entre utilisateurs Stormi.',
            comingSoon: 'Bientôt disponible',
            description: 'Les fonctionnalités communautaires (discussions, partage de listes, recommandations) arrivent prochainement.'
        },
        help: {
            title: 'Centre d\'aide',
            subtitle: 'Questions fréquentes et support.',
            faqTitle: 'Questions fréquentes',
            faqUpload: 'Comment ajouter des fichiers ?',
            faqUploadAnswer: 'Utilisez le menu « Ajouter » pour envoyer des médias. Les formats audio, vidéo, images et documents sont acceptés.',
            faqStorage: 'Où sont stockées mes données ?',
            faqStorageAnswer: 'Vos fichiers sont hébergés de manière sécurisée sur l\'infrastructure Stormi (Cloudflare R2). Vous conservez l\'accès tant que votre compte est actif.',
            contactTitle: 'Contact',
            contactText: 'Pour toute question, contactez le support Stormi.'
        },
        dialogs: {
            logoutTitle: 'Déconnexion',
            logoutMessage: 'Êtes-vous sûr de vouloir vous déconnecter ?'
        },
        errors: {
            fetchFailed: 'Impossible de récupérer les données',
            unknown: 'Une erreur inattendue est survenue',
            networkError: 'Erreur de connexion au serveur',
            statsLoadFailed: 'Impossible de charger les statistiques',
            authFailed: 'Échec de l\'authentification',
            saveFailed: 'Impossible de sauvegarder',
            deleteFailed: 'Impossible de supprimer',
            loadFailed: 'Impossible de charger le fichier',
            title: 'Erreur',
            retry: 'Réessayer',
            fetchFilesFailed: 'Erreur lors de la récupération des fichiers',
            errorWithStatus: 'Erreur {status}',
            saveFailedTryAgain: 'Erreur lors de la sauvegarde. Veuillez réessayer.'
        }
    },
    en: {
        nav: {
            home: 'Home',
            upload: 'Upload',
            add: 'Add',
            files: 'Files',
            watch: 'Watch',
            listen: 'Listen',
            library: 'Library',
            community: 'Community',
            localPlayer: 'Local player',
            profile: 'Profile',
            logout: 'Logout',
            homeAriaLabel: 'Stormi home page',
            addAriaLabel: 'Add media',
            watchAriaLabel: 'Movies and TV shows',
            listenAriaLabel: 'Music',
            libraryAriaLabel: 'Images, documents and archives',
            communityAriaLabel: 'Stormi community space',
            localPlayerAriaLabel: 'Play local files without uploading',
            profileAriaLabel: 'My account and settings',
            menuOpenAriaLabel: 'Open navigation menu',
            menuCloseAriaLabel: 'Close navigation menu'
        },
        localPlayer: {
            title: 'Local player',
            subtitle: 'Add audio or video files from your device to play them in sequence.',
            dropZone: 'Drag and drop your files here',
            dropZoneOr: 'or',
            browse: 'Browse',
            play: 'Start playback',
            remove: 'Remove',
            emptyState: 'No files selected',
            emptyStateHint: 'Add audio or video tracks to build a playlist.',
            acceptedFormats: 'Audio and video (MP3, WAV, MP4, WebM, etc.)',
            playlistCount: 'Playlist ({count} file(s))'
        },
        common: {
            loading: 'Loading...',
            error: 'Error',
            success: 'Success',
            cancel: 'Cancel',
            confirm: 'Confirm',
            retry: 'Retry',
            delete: 'Delete',
            save: 'Save',
            close: 'Close',
            open: 'Open',
            untitled: 'Untitled',
            user: 'User',
            yes: 'Yes',
            no: 'No',
            unnamed: 'Untitled',
            imageFallback: 'Image',
            progression: 'Progress',
            later: 'Later',
            cancelWithCountdown: 'Cancel ({seconds}s)'
        },
        splash: {
            loadingLong: 'Loading is taking longer than expected. You can try again.',
            loading: 'Loading…',
            redirecting: 'Redirecting…',
            connecting: 'Connecting…',
            ariaLabel: 'Stormi splash screen'
        },
        meta: {
            pageTitleHome: 'Home | Stormi',
            pageTitleNotFound: 'Page not found | Stormi',
            pageTitleMusics: 'Music | Stormi',
            pageTitleUpload: 'Upload | Stormi',
            pageTitleLibrary: 'Library | Stormi',
            pageTitleProfile: 'Profile | Stormi',
            pageTitleManageProfile: 'Manage profile | Stormi',
            pageTitleThemeSettings: 'Appearance | Stormi',
            pageTitleLanguageSettings: 'Language | Stormi',
            pageTitleHelp: 'Help center | Stormi',
            pageTitleCommunity: 'Community | Stormi',
            pageDescriptionHome: 'Your personal storage and streaming space. Manage your files, statistics and access your media.',
            pageDescriptionProfile: 'Manage your Stormi profile, language and account.',
            pageDescriptionLibrary: 'Your images, documents, archives and files. Manage your file library.',
            pageDescriptionManageProfile: 'Language, logout and local data.',
            pageDescriptionLanguageSettings: 'Choose the application language.',
            pageDescriptionHelp: 'FAQ and Stormi support.',
            pageDescriptionCommunity: 'Stormi community space: share and connect with other users.'
        },
        community: {
            title: 'Community',
            subtitle: 'Share and connect with other Stormi users.',
            comingSoon: 'Coming soon',
            description: 'Community features (discussions, list sharing, recommendations) are coming soon.'
        },
        media: {
            play: 'Play',
            moreInfo: 'More info',
            addToList: 'Add to my list'
        },
        musics: {
            artist: 'Artist',
            album: 'Album',
            title: 'Title',
            unknownArtist: 'Unknown artist',
            unknownAlbum: 'Untitled',
            toIdentify: 'To identify',
            duration: 'Duration',
            action: 'Action',
            albums: 'Albums',
            playAll: 'Play all',
            uploadMusicHint: 'Upload music files to get started',
            trackCount: 'track',
            trackCountPlural: 'tracks',
            yourArtists: 'Your artists'
        },
        match: {
            loadingInfo: 'Loading information...',
            titleDetected: 'Title detected in metadata',
            artistDetected: 'Artist detected',
            artistDetectedInMetadata: 'Artist detected in metadata',
            fileLabel: 'File',
            identifyTrack: 'Identify this track',
            identifyMovie: 'Identify this movie/show',
            step1Artist: 'Choose artist',
            step2Title: 'Enter title',
            searchArtistTitle: 'Search for artist',
            artistPlaceholder: 'Artist name...',
            searchButton: 'Search',
            searching: 'Searching...',
            selectedArtistLabel: 'Selected artist',
            songTitlePlaceholder: 'Song title...',
            loadingAlbums: 'Loading albums...',
            viewAllAlbums: 'View all albums by',
            searchMovieOrShow: 'Search for a movie or show',
            fileNotFound: 'File not found',
            searchArtistsError: 'Unable to search for artists. Check your connection or try again.',
            searchAlbumsError: 'Unable to search for albums. Check your connection or try again.',
            loadAlbumsError: 'Unable to load albums. Check your connection or try again.',
            searchMoviesError: 'Unable to search for movies/shows. Check your connection or try again.',
            pleaseEnterTitle: 'Please enter a title',
            pleaseSelectArtist: 'Please select an artist',
            pleaseSelectMovie: 'Please select a movie or show',
            allAlbumsBy: 'All albums by',
            albumsContaining: 'Albums containing',
            movieOrShowPlaceholder: 'Movie or show title...',
            selectArtist: 'Select',
            selectMatch: 'Select',
            selectAlbum: 'Select',
            deselectAlbum: 'Deselect',
            step4Confirm: '4. Confirm',
            confirmSelection: 'Confirm selection',
            saving: 'Saving...',
            cancelAndReturn: 'Cancel and return to files',
            titleFallback: 'Title'
        },
        player: {
            dismissRestore: 'Dismiss restore',
            resumePlayback: 'Resume playback',
            previousTrack: 'Previous track',
            nextTrack: 'Next track',
            pause: 'Pause',
            play: 'Play',
            closePlayer: 'Close player',
            miniPlayer: 'Mini player'
        },
        carousel: {
            scrollLeft: 'Scroll left',
            scrollRight: 'Scroll right'
        },
        actions: {
            select: 'Select',
            deselect: 'Deselect',
            view: 'View',
            open: 'Open',
            identify: 'Identify',
            backToList: 'Back to list',
            viewAlbumsBy: 'View albums by',
            viewTracksOf: 'View tracks of',
            playTrack: 'Play',
            identifyTrack: 'Identify',
            viewImage: 'Image preview',
            thisImage: 'this image',
            thisFile: 'this file',
            thisDocument: 'this document',
            thisArchive: 'this archive',
            thisExecutable: 'this executable',
            thisMovie: 'this movie',
            thisShow: 'this show',
            playMovie: 'Play movie',
            playSeries: 'Play series',
            playEpisode: 'Play episode'
        },
        info: {
            myList: 'My list'
        },
        viewer: {
            previewImage: 'Image preview',
            closePreview: 'Close preview'
        },
        loading: {
            pageLoad: 'Page loading'
        },
        toast: {
            closeHint: 'Click or press Enter to close',
            close: 'Close notification'
        },
        rating: {
            rateStars: 'Rate star',
            rateStarsPlural: 'Rate stars',
            clickToRate: 'Click to rate',
            yourRating: 'Your rating',
            averageRating: 'Average rating'
        },
        pdf: {
            previewUnavailable: 'Preview unavailable'
        },
        language: {
            selectLanguage: 'Select language',
            title: 'Language',
            subtitle: 'Choose the application language. Your choice is saved for this account.',
            backToManageProfile: 'Back to Manage profile'
        },
        login: {
            title: 'Stormi',
            subtitle: 'Sign in to access your space',
            connectWithGoogle: 'Sign in with Google:',
            electronMode: 'Electron mode active - Authentication will open in an Electron window',
            terms: 'By signing in, you agree to our terms of use and privacy policy.',
            configError: 'Configuration error',
            configUnavailable: 'Configuration unavailable. Please try again later.',
            googleAuthError: 'Error during Google authentication',
            configErrorDetail: 'GOOGLE_CLIENT_ID not configured on Cloudflare. Please configure your application.'
        },
        home: {
            title: 'Dashboard',
            welcome: 'Welcome to your personal space, {name}',
            stats: 'Statistics',
            statsDescription: 'Overview of your activity',
            fileCount: 'Number of files',
            totalSize: 'GB uploaded',
            billing: 'Amount to pay',
            billingDescription: 'Monthly billing',
            amountToPay: 'Amount to pay',
            monthlyBilling: 'Monthly billing',
            for: 'for',
            rate: 'Rate: $0.030/GB-month (rounded up)',
            emptyTitle: 'Welcome! Add your first media',
            emptyDescription: 'Start by adding your media to enjoy your storage and streaming space.',
            uploadFirst: 'Add media',
            continueWatching: 'Continue watching',
            recentlyAdded: 'Recently added',
            showStats: 'Show stats',
            hideStats: 'Hide stats',
            spaceVideos: 'Videos',
            spaceMusics: 'Music',
            spaceLibrary: 'Library',
            spaceAdd: 'Add',
            seeAllVideos: 'Watch movies & series',
            seeAllMusics: 'Listen to my music',
            addMore: 'Add more',
            emptyHint: 'Your files will appear in these spaces once added.'
        },
        upload: {
            title: 'Upload Manager',
            selectFile: 'Select a file',
            dragDrop: 'Drag and drop your files here',
            globalProgress: 'Global progress',
            filesCompleted: 'files completed',
            inProgress: 'in progress',
            totalSpeed: 'Total speed',
            timeRemaining: 'Time remaining',
            uploaded: 'Uploaded',
            showDetails: 'Show details',
            hideDetails: 'Hide details',
            pause: 'Pause',
            resume: 'Resume',
            cancel: 'Cancel',
            completed: 'Completed',
            error: 'Error',
            noUploads: 'No uploads in progress',
            status: 'Status',
            size: 'Size',
            speed: 'Speed',
            remainingTime: 'Remaining time',
            successMessage: 'File added successfully',
            nextStep: 'Next step',
            viewHome: 'Go to my home',
            viewLibrary: 'View library',
            addAnother: 'Add another file',
            nextStepHint: 'Where would you like to go?',
            uploadButton: 'Upload',
            filesWillAppearHere: 'Files you add will appear here',
            fileUploaded: 'file uploaded',
            filesUploaded: 'files uploaded',
            fast: 'Fast',
            fastDescription: 'Optimized upload with real-time progress',
            secure: 'Secure',
            secureDescription: 'All uploads are authenticated and protected',
            cloudflareStorage: 'Cloudflare Storage',
            cloudflareStorageDescription: 'Your files are stored on Cloudflare R2',
            spaceUsed: 'Space used',
            unlimited: 'Unlimited'
        },
        localPlayerMeta: {
            pageTitle: 'Local player | Stormi',
            pageDescription: 'Play audio and video files from your device in sequence.'
        },
        footer: {
            allRightsReserved: 'All rights reserved'
        },
        notFound: {
            title: 'Page not found',
            description: 'This page does not exist or has been moved.',
            backHome: 'Back to home',
            addFiles: 'Add files'
        },
        videos: {
            films: 'Movies',
            series: 'TV Shows',
            unidentifiedFiles: 'Files to identify',
            myVideos: 'My videos',
            myFilms: 'My movies',
            mySeries: 'My series',
            clickToIdentify: 'Click to identify',
            tvShows: 'TV Shows',
            collections: 'Collections',
            film: 'movie',
            season: 'season',
            episode: 'Episode',
            recentlyAdded: 'Recently Added',
            redirectToFilms: 'Redirecting to Movies',
            top10: 'Top 10 - Highest rated'
        },
        categories: {
            videos: 'Videos',
            musics: 'Musics',
            images: 'Images',
            documents: 'Documents',
            archives: 'Archives',
            executables: 'Executables',
            others: 'Other files',
            videosHint: 'Movies, series and videos',
            musicsHint: 'Audio tracks and albums',
            imagesHint: 'Photos and images',
            documentsHint: 'PDF and documents',
            archivesHint: 'ZIP, RAR and archives',
            executablesHint: 'Programs and executables',
            othersHint: 'Other file types'
        },
        emptyStates: {
            noVideos: 'No videos',
            noVideosDescription: 'Start building your video library',
            uploadFirstVideo: '📤 Upload your first video',
            noFilms: 'No movies',
            noFilmsDescription: 'Upload your movies to add them to your collection',
            uploadFirstFilm: '📤 Upload your first movie',
            noSeries: 'No TV shows',
            noSeriesDescription: 'Upload your TV show episodes',
            uploadFirstSeries: '📤 Upload your first series',
            noMusics: 'No musics',
            noMusicsDescription: 'Start building your music library',
            uploadFirstMusic: '📤 Upload your first music',
            noImages: 'No images',
            noImagesDescription: 'Start building your image gallery',
            uploadFirstImage: '📤 Upload your first image',
            noDocuments: 'No documents',
            noDocumentsDescription: 'Start organizing your documents',
            uploadFirstDocument: '📤 Upload your first document',
            noArchives: 'No archives',
            noArchivesDescription: 'Start organizing your archive files',
            uploadFirstArchive: '📤 Upload your first archive',
            noExecutables: 'No executables',
            noExecutablesDescription: 'Organize your executable files',
            uploadFirstExecutable: '📤 Upload your first executable',
            noOthers: 'No other files',
            noOthersDescription: 'Files that don\'t match any category will appear here',
            uploadFile: '📤 Upload a file'
        },
        profile: {
            title: 'My Profile',
            subtitle: 'Manage your personal information and preferences',
            language: 'Language',
            languageDescription: 'Choose your preferred language',
            emailVerified: 'Email verified',
            emailNotVerified: 'Email not verified',
            personalInfo: 'Personal information',
            fullName: 'Full name',
            notSpecified: 'Not specified',
            emailLabel: 'Email',
            verificationStatus: 'Verification status',
            userId: 'User ID',
            idLabel: 'ID',
            emailVerifiedLabel: 'Email verified',
            connectedAccount: 'Connected account',
            googleAccount: 'Google account',
            connectedViaGoogle: 'Connected via Google OAuth',
            accountSecureHint: 'Your account is secured with Google authentication. To update your information, please update it directly on your Google account.',
            actions: 'Actions',
            logout: 'Log out',
            clearLocalData: 'Clear local data',
            confirmClearLocalData: 'Are you sure you want to delete all your local data?',
            logoutNote: 'Logging out will remove your current session but will not delete your account. To permanently delete your account, please go to your Google account.',
            noteLabel: 'Note:'
        },
        profileMenu: {
            manageProfile: 'Manage profile',
            account: 'Account',
            helpCenter: 'Help center'
        },
        manageProfile: {
            title: 'Manage profile',
            subtitle: 'Language, logout and local data.',
            backToAccount: 'Back to account'
        },
        theme: {
            title: 'Appearance',
            subtitle: 'Choose the application theme. Your choice is saved for this account.',
            appearance: 'Theme',
            light: 'Light',
            dark: 'Dark',
            grey: 'Grey',
            saved: 'Theme saved',
            backToManageProfile: 'Back to Manage profile',
            customThemes: 'Custom themes',
            addCustom: 'Add theme',
            themeName: 'Theme name',
            themeNamePlaceholder: 'e.g. My blue',
            color: 'Color',
            maxReached: 'Maximum 10 custom themes. Delete one to add another.',
            delete: 'Delete',
            deleteConfirm: 'Delete theme « {name} »?',
            apply: 'Apply',
            customThemeDeleted: 'Theme deleted'
        },
        help: {
            title: 'Help center',
            subtitle: 'FAQ and support.',
            faqTitle: 'Frequently asked questions',
            faqUpload: 'How do I add files?',
            faqUploadAnswer: 'Use the « Add » menu to upload media. Audio, video, image and document formats are supported.',
            faqStorage: 'Where is my data stored?',
            faqStorageAnswer: 'Your files are stored securely on Stormi infrastructure (Cloudflare R2). You keep access as long as your account is active.',
            contactTitle: 'Contact',
            contactText: 'For any questions, contact Stormi support.'
        },
        dialogs: {
            logoutTitle: 'Logout',
            logoutMessage: 'Are you sure you want to logout?'
        },
        errors: {
            fetchFailed: 'Unable to fetch data',
            unknown: 'An unexpected error occurred',
            networkError: 'Server connection error',
            statsLoadFailed: 'Unable to load statistics',
            authFailed: 'Authentication failed',
            saveFailed: 'Unable to save',
            deleteFailed: 'Unable to delete',
            loadFailed: 'Unable to load file',
            title: 'Error',
            retry: 'Retry',
            fetchFilesFailed: 'Error while fetching files',
            errorWithStatus: 'Error {status}',
            saveFailedTryAgain: 'Error while saving. Please try again.'
        }
    },
    es: {
        nav: {
            home: 'Inicio',
            upload: 'Subir',
            add: 'Añadir',
            files: 'Archivos',
            watch: 'Ver',
            listen: 'Escuchar',
            library: 'Biblioteca',
            community: 'Comunidad',
            localPlayer: 'Reproductor local',
            profile: 'Perfil',
            logout: 'Cerrar sesión',
            homeAriaLabel: 'Página de inicio Stormi',
            addAriaLabel: 'Añadir medios',
            watchAriaLabel: 'Películas y series',
            listenAriaLabel: 'Música',
            libraryAriaLabel: 'Imágenes, documentos y archivos',
            communityAriaLabel: 'Espacio comunidad Stormi',
            localPlayerAriaLabel: 'Reproducir archivos locales sin subir',
            profileAriaLabel: 'Mi cuenta y ajustes',
            menuOpenAriaLabel: 'Abrir menú de navegación',
            menuCloseAriaLabel: 'Cerrar menú de navegación'
        },
        localPlayer: {
            title: 'Reproductor local',
            subtitle: 'Añade archivos de audio o vídeo desde tu dispositivo para reproducirlos en secuencia.',
            dropZone: 'Arrastra y suelta tus archivos aquí',
            dropZoneOr: 'o',
            browse: 'Examinar',
            play: 'Iniciar reproducción',
            remove: 'Quitar',
            emptyState: 'Ningún archivo seleccionado',
            emptyStateHint: 'Añade pistas de audio o vídeo para crear una lista de reproducción.',
            acceptedFormats: 'Audio y vídeo (MP3, WAV, MP4, WebM, etc.)',
            playlistCount: 'Lista ({count} archivo(s))'
        },
        common: {
            loading: 'Cargando...',
            error: 'Error',
            success: 'Éxito',
            cancel: 'Cancelar',
            confirm: 'Confirmar',
            retry: 'Reintentar',
            delete: 'Eliminar',
            save: 'Guardar',
            close: 'Cerrar',
            open: 'Abrir',
            untitled: 'Sin título',
            user: 'Usuario',
            yes: 'Sí',
            no: 'No',
            unnamed: 'Sin nombre',
            imageFallback: 'Imagen',
            progression: 'Progreso',
            later: 'Más tarde',
            cancelWithCountdown: 'Cancelar ({seconds}s)'
        },
        splash: {
            loadingLong: 'La carga tarda más de lo habitual. Puedes intentarlo de nuevo.',
            loading: 'Cargando…',
            redirecting: 'Redirigiendo…',
            connecting: 'Conectando…',
            ariaLabel: 'Pantalla de inicio Stormi'
        },
        meta: {
            pageTitleHome: 'Inicio | Stormi',
            pageTitleNotFound: 'Página no encontrada | Stormi',
            pageTitleMusics: 'Música | Stormi',
            pageTitleUpload: 'Subir | Stormi',
            pageTitleLibrary: 'Biblioteca | Stormi',
            pageTitleProfile: 'Perfil | Stormi',
            pageTitleManageProfile: 'Gestionar perfil | Stormi',
            pageTitleThemeSettings: 'Apariencia | Stormi',
            pageTitleLanguageSettings: 'Idioma | Stormi',
            pageTitleHelp: 'Centro de ayuda | Stormi',
            pageTitleCommunity: 'Comunidad | Stormi',
            pageDescriptionHome: 'Tu espacio personal de almacenamiento y streaming. Gestiona tus archivos, estadísticas y accede a tus medios.',
            pageDescriptionProfile: 'Gestiona tu perfil Stormi, idioma y cuenta.',
            pageDescriptionLibrary: 'Tus imágenes, documentos, archivos y archivos. Gestiona tu biblioteca de archivos.',
            pageDescriptionManageProfile: 'Idioma, cerrar sesión y datos locales.',
            pageDescriptionLanguageSettings: 'Elige el idioma de la aplicación.',
            pageDescriptionHelp: 'Preguntas frecuentes y soporte Stormi.',
            pageDescriptionCommunity: 'Espacio comunidad Stormi: comparte y conecta con otros usuarios.'
        },
        community: {
            title: 'Comunidad',
            subtitle: 'Comparte y conecta con otros usuarios de Stormi.',
            comingSoon: 'Próximamente',
            description: 'Las funciones comunitarias (debates, compartir listas, recomendaciones) llegarán pronto.'
        },
        media: {
            play: 'Reproducir',
            moreInfo: 'Más información',
            addToList: 'Añadir a mi lista'
        },
        musics: {
            artist: 'Artista',
            album: 'Álbum',
            title: 'Título',
            unknownArtist: 'Artista desconocido',
            unknownAlbum: 'Sin nombre',
            toIdentify: 'Por identificar',
            duration: 'Duración',
            action: 'Acción',
            albums: 'Álbumes',
            playAll: 'Reproducir todo',
            uploadMusicHint: 'Sube archivos de música para comenzar',
            trackCount: 'pista',
            trackCountPlural: 'pistas',
            yourArtists: 'Tus artistas'
        },
        match: {
            loadingInfo: 'Cargando información...',
            titleDetected: 'Título detectado en los metadatos',
            artistDetected: 'Artista detectado',
            artistDetectedInMetadata: 'Artista detectado en los metadatos',
            fileLabel: 'Archivo',
            identifyTrack: 'Identificar esta pista',
            identifyMovie: 'Identificar esta película/serie',
            step1Artist: 'Elegir artista',
            step2Title: 'Introducir título',
            searchArtistTitle: 'Buscar artista',
            artistPlaceholder: 'Nombre del artista...',
            searchButton: 'Buscar',
            searching: 'Buscando...',
            selectedArtistLabel: 'Artista seleccionado',
            songTitlePlaceholder: 'Título de la canción...',
            loadingAlbums: 'Cargando álbumes...',
            viewAllAlbums: 'Ver todos los álbumes de',
            searchMovieOrShow: 'Buscar una película o serie',
            fileNotFound: 'Archivo no encontrado',
            searchArtistsError: 'No se pueden buscar artistas. Comprueba tu conexión o inténtalo de nuevo.',
            searchAlbumsError: 'No se pueden buscar álbumes. Comprueba tu conexión o inténtalo de nuevo.',
            loadAlbumsError: 'No se pueden cargar los álbumes. Comprueba tu conexión o inténtalo de nuevo.',
            searchMoviesError: 'No se pueden buscar películas/series. Comprueba tu conexión o inténtalo de nuevo.',
            pleaseEnterTitle: 'Por favor, introduce un título',
            pleaseSelectArtist: 'Por favor, selecciona un artista',
            pleaseSelectMovie: 'Por favor, selecciona una película o serie',
            allAlbumsBy: 'Todos los álbumes de',
            albumsContaining: 'Álbumes que contienen',
            movieOrShowPlaceholder: 'Título de la película o serie...',
            selectArtist: 'Seleccionar',
            selectMatch: 'Seleccionar',
            selectAlbum: 'Seleccionar',
            deselectAlbum: 'Deseleccionar',
            step4Confirm: '4. Confirmar',
            confirmSelection: 'Confirmar selección',
            saving: 'Guardando...',
            cancelAndReturn: 'Cancelar y volver a los archivos',
            titleFallback: 'Título'
        },
        player: {
            dismissRestore: 'Descartar restauración',
            resumePlayback: 'Reanudar reproducción',
            previousTrack: 'Pista anterior',
            nextTrack: 'Pista siguiente',
            pause: 'Pausar',
            play: 'Reproducir',
            closePlayer: 'Cerrar reproductor',
            miniPlayer: 'Mini reproductor'
        },
        carousel: {
            scrollLeft: 'Desplazar a la izquierda',
            scrollRight: 'Desplazar a la derecha'
        },
        actions: {
            select: 'Seleccionar',
            deselect: 'Deseleccionar',
            view: 'Ver',
            open: 'Abrir',
            identify: 'Identificar',
            backToList: 'Volver a la lista',
            viewAlbumsBy: 'Ver álbumes de',
            viewTracksOf: 'Ver pistas de',
            playTrack: 'Reproducir',
            identifyTrack: 'Identificar',
            viewImage: 'Vista previa de la imagen',
            thisImage: 'esta imagen',
            thisFile: 'este archivo',
            thisDocument: 'este documento',
            thisArchive: 'este archivo',
            thisExecutable: 'este ejecutable',
            thisMovie: 'esta película',
            thisShow: 'esta serie',
            playMovie: 'Reproducir película',
            playSeries: 'Reproducir serie',
            playEpisode: 'Reproducir episodio'
        },
        info: {
            myList: 'Mi lista'
        },
        viewer: {
            previewImage: 'Vista previa de la imagen',
            closePreview: 'Cerrar vista previa'
        },
        loading: {
            pageLoad: 'Cargando página'
        },
        toast: {
            closeHint: 'Haz clic o pulsa Entrar para cerrar',
            close: 'Cerrar notificación'
        },
        rating: {
            rateStars: 'Valorar estrella',
            rateStarsPlural: 'Valorar estrellas',
            clickToRate: 'Haz clic para valorar',
            yourRating: 'Tu valoración',
            averageRating: 'Valoración media'
        },
        pdf: {
            previewUnavailable: 'Vista previa no disponible'
        },
        language: {
            selectLanguage: 'Seleccionar idioma',
            title: 'Idioma',
            subtitle: 'Elige el idioma de la aplicación. Tu elección se guarda para esta cuenta.',
            backToManageProfile: 'Volver a Gestionar perfil'
        },
        login: {
            title: 'Stormi',
            subtitle: 'Inicia sesión para acceder a tu espacio',
            connectWithGoogle: 'Iniciar sesión con Google:',
            electronMode: 'Modo Electron activo - La autenticación se abrirá en una ventana Electron',
            terms: 'Al iniciar sesión, aceptas nuestros términos de uso y política de privacidad.',
            configError: 'Error de configuración',
            configUnavailable: 'Configuración no disponible. Por favor, inténtalo de nuevo más tarde.',
            googleAuthError: 'Error durante la autenticación de Google',
            configErrorDetail: 'GOOGLE_CLIENT_ID no configurado en Cloudflare. Por favor, configura tu aplicación.'
        },
        home: {
            title: 'Panel de control',
            welcome: 'Bienvenido a tu espacio personal, {name}',
            stats: 'Estadísticas',
            statsDescription: 'Resumen de tu actividad',
            fileCount: 'Número de archivos',
            totalSize: 'GB subidos',
            billing: 'Cantidad a pagar',
            billingDescription: 'Facturación mensual',
            amountToPay: 'Cantidad a pagar',
            monthlyBilling: 'Facturación mensual',
            for: 'para',
            rate: 'Tarifa: $0.030/GB-mes (redondeado hacia arriba)',
            emptyTitle: '¡Bienvenido! Añade tus primeros medios',
            emptyDescription: 'Empieza añadiendo tus medios para disfrutar de tu espacio de almacenamiento y streaming.',
            uploadFirst: 'Añadir medios',
            continueWatching: 'Continuar viendo',
            recentlyAdded: 'Añadidos recientemente',
            showStats: 'Ver estadísticas',
            hideStats: 'Ocultar estadísticas',
            spaceVideos: 'Videos',
            spaceMusics: 'Música',
            spaceLibrary: 'Biblioteca',
            spaceAdd: 'Añadir',
            seeAllVideos: 'Ver películas y series',
            seeAllMusics: 'Escuchar mi música',
            addMore: 'Añadir más',
            emptyHint: 'Tus archivos aparecerán aquí una vez añadidos.'
        },
        upload: {
            title: 'Gestor de carga',
            selectFile: 'Seleccionar un archivo',
            dragDrop: 'Arrastra y suelta tu archivo aquí',
            dragDropOr: 'o haz clic para explorar tus archivos',
            supportedFormats: 'Formatos admitidos: imágenes, videos, documentos (máx. 100MB)',
            globalProgress: 'Progreso global',
            filesCompleted: 'archivos completados',
            inProgress: 'en progreso',
            totalSpeed: 'Velocidad total',
            timeRemaining: 'Tiempo restante',
            uploaded: 'Subido',
            showDetails: 'Mostrar detalles',
            hideDetails: 'Ocultar detalles',
            pause: 'Pausa',
            resume: 'Reanudar',
            cancel: 'Cancelar',
            completed: 'Completado',
            error: 'Error',
            noUploads: 'No hay cargas en progreso',
            status: 'Estado',
            size: 'Tamaño',
            speed: 'Velocidad',
            remainingTime: 'Tiempo restante',
            successMessage: 'Archivo añadido correctamente',
            nextStep: 'Siguiente paso',
            viewHome: 'Ir a mi inicio',
            viewLibrary: 'Ver biblioteca',
            addAnother: 'Añadir otro archivo',
            nextStepHint: '¿A dónde quieres ir?',
            uploadButton: 'Enviar',
            filesWillAppearHere: 'Los archivos que añadas aparecerán aquí',
            fileUploaded: 'archivo subido',
            filesUploaded: 'archivos subidos',
            fast: 'Rápido',
            fastDescription: 'Carga optimizada con progreso en tiempo real',
            secure: 'Seguro',
            secureDescription: 'Todas las cargas están autenticadas y protegidas',
            cloudflareStorage: 'Almacenamiento Cloudflare',
            cloudflareStorageDescription: 'Tus archivos se almacenan en R2 de Cloudflare',
            spaceUsed: 'Espacio utilizado',
            unlimited: 'Ilimitado'
        },
        localPlayerMeta: {
            pageTitle: 'Reproductor local | Stormi',
            pageDescription: 'Reproduce archivos de audio y vídeo desde tu dispositivo en secuencia.'
        },
        footer: {
            allRightsReserved: 'Todos los derechos reservados'
        },
        notFound: {
            title: 'Página no encontrada',
            description: 'Esta página no existe o ha sido movida.',
            backHome: 'Volver al inicio',
            addFiles: 'Añadir archivos'
        },
        videos: {
            films: 'Películas',
            series: 'Series',
            unidentifiedFiles: 'Archivos a identificar',
            myVideos: 'Mis videos',
            myFilms: 'Mis películas',
            mySeries: 'Mis series',
            clickToIdentify: 'Haz clic para identificar',
            tvShows: 'Series de TV',
            collections: 'Colecciones',
            film: 'película',
            season: 'temporada',
            episode: 'Episodio',
            recentlyAdded: 'Añadidos recientemente',
            redirectToFilms: 'Redirigiendo a Películas',
            top10: 'Top 10 - Mejor valorados'
        },
        categories: {
            videos: 'Videos',
            musics: 'Músicas',
            images: 'Imágenes',
            documents: 'Documentos',
            archives: 'Archivos',
            executables: 'Ejecutables',
            others: 'Otros archivos',
            videosHint: 'Películas, series y vídeos',
            musicsHint: 'Pistas de audio y álbumes',
            imagesHint: 'Fotos e imágenes',
            documentsHint: 'PDF y documentos',
            archivesHint: 'ZIP, RAR y archivos',
            executablesHint: 'Programas y ejecutables',
            othersHint: 'Otros tipos de archivos'
        },
        emptyStates: {
            noVideos: 'Sin videos',
            noVideosDescription: 'Comienza a construir tu biblioteca de videos',
            uploadFirstVideo: '📤 Sube tu primer video',
            noFilms: 'Sin películas',
            noFilmsDescription: 'Sube tus películas para añadirlas a tu colección',
            uploadFirstFilm: '📤 Sube tu primera película',
            noSeries: 'Sin series',
            noSeriesDescription: 'Sube tus episodios de series de TV',
            uploadFirstSeries: '📤 Sube tu primera serie',
            noMusics: 'Sin músicas',
            noMusicsDescription: 'Comienza a construir tu biblioteca musical',
            uploadFirstMusic: '📤 Sube tu primera música',
            noImages: 'Sin imágenes',
            noImagesDescription: 'Comienza a construir tu galería de imágenes',
            uploadFirstImage: '📤 Sube tu primera imagen',
            noDocuments: 'Sin documentos',
            noDocumentsDescription: 'Comienza a organizar tus documentos',
            uploadFirstDocument: '📤 Sube tu primer documento',
            noArchives: 'Sin archivos',
            noArchivesDescription: 'Comienza a organizar tus archivos',
            uploadFirstArchive: '📤 Sube tu primer archivo',
            noExecutables: 'Sin ejecutables',
            noExecutablesDescription: 'Organiza tus archivos ejecutables',
            uploadFirstExecutable: '📤 Sube tu primer ejecutable',
            noOthers: 'Sin otros archivos',
            noOthersDescription: 'Los archivos que no coincidan con ninguna categoría aparecerán aquí',
            uploadFile: '📤 Sube un archivo'
        },
        profile: {
            title: 'Mi Perfil',
            subtitle: 'Administra tu información personal y preferencias',
            language: 'Idioma',
            languageDescription: 'Elige tu idioma preferido',
            emailVerified: 'Email verificado',
            emailNotVerified: 'Email no verificado',
            personalInfo: 'Información personal',
            fullName: 'Nombre completo',
            notSpecified: 'No especificado',
            emailLabel: 'Email',
            verificationStatus: 'Estado de verificación',
            userId: 'ID de usuario',
            idLabel: 'ID',
            emailVerifiedLabel: 'Correo verificado',
            connectedAccount: 'Cuenta conectada',
            googleAccount: 'Cuenta de Google',
            connectedViaGoogle: 'Conectado mediante Google OAuth',
            accountSecureHint: 'Tu cuenta está protegida con la autenticación de Google. Para modificar tu información, actualízala directamente en tu cuenta de Google.',
            actions: 'Acciones',
            logout: 'Cerrar sesión',
            clearLocalData: 'Borrar datos locales',
            confirmClearLocalData: '¿Estás seguro de que quieres eliminar todos tus datos locales?',
            logoutNote: 'Cerrar sesión eliminará tu sesión actual pero no borrará tu cuenta. Para eliminar tu cuenta permanentemente, ve a tu cuenta de Google.',
            noteLabel: 'Nota:'
        },
        profileMenu: {
            manageProfile: 'Gestionar perfil',
            account: 'Cuenta',
            helpCenter: 'Centro de ayuda'
        },
        manageProfile: {
            title: 'Gestionar perfil',
            subtitle: 'Idioma, cerrar sesión y datos locales.',
            backToAccount: 'Volver a la cuenta'
        },
        theme: {
            title: 'Apariencia',
            subtitle: 'Elige el tema de la aplicación. Tu elección se guarda para esta cuenta.',
            appearance: 'Tema',
            light: 'Claro',
            dark: 'Oscuro',
            grey: 'Gris',
            saved: 'Tema guardado',
            backToManageProfile: 'Volver a Gestionar perfil',
            customThemes: 'Temas personalizados',
            addCustom: 'Añadir tema',
            themeName: 'Nombre del tema',
            themeNamePlaceholder: 'Ej. Mi azul',
            color: 'Color',
            maxReached: 'Máximo 10 temas personalizados. Elimina uno para añadir otro.',
            delete: 'Eliminar',
            deleteConfirm: '¿Eliminar el tema « {name} »?',
            apply: 'Aplicar',
            customThemeDeleted: 'Tema eliminado'
        },
        help: {
            title: 'Centro de ayuda',
            subtitle: 'Preguntas frecuentes y soporte.',
            faqTitle: 'Preguntas frecuentes',
            faqUpload: '¿Cómo añadir archivos?',
            faqUploadAnswer: 'Usa el menú « Añadir » para subir medios. Se aceptan formatos de audio, vídeo, imagen y documentos.',
            faqStorage: '¿Dónde se almacenan mis datos?',
            faqStorageAnswer: 'Tus archivos se almacenan de forma segura en la infraestructura Stormi (Cloudflare R2). Conservas el acceso mientras tu cuenta esté activa.',
            contactTitle: 'Contacto',
            contactText: 'Para cualquier pregunta, contacta con el soporte de Stormi.'
        },
        dialogs: {
            logoutTitle: 'Cerrar sesión',
            logoutMessage: '¿Estás seguro de que quieres cerrar sesión?'
        },
        errors: {
            fetchFailed: 'No se pueden obtener los datos',
            unknown: 'Se produjo un error inesperado',
            networkError: 'Error de conexión al servidor',
            statsLoadFailed: 'No se pueden cargar las estadísticas',
            authFailed: 'Error de autenticación',
            saveFailed: 'No se puede guardar',
            deleteFailed: 'No se puede eliminar',
            loadFailed: 'No se puede cargar el archivo',
            title: 'Error',
            retry: 'Reintentar',
            fetchFilesFailed: 'Error al recuperar los archivos',
            errorWithStatus: 'Error {status}',
            saveFailedTryAgain: 'Error al guardar. Por favor, inténtalo de nuevo.'
        }
    },
    de: {
        nav: {
            home: 'Startseite',
            upload: 'Hochladen',
            add: 'Hinzufügen',
            files: 'Dateien',
            watch: 'Ansehen',
            listen: 'Anhören',
            library: 'Bibliothek',
            community: 'Community',
            localPlayer: 'Lokaler Player',
            profile: 'Profil',
            logout: 'Abmelden',
            homeAriaLabel: 'Stormi Startseite',
            addAriaLabel: 'Medien hinzufügen',
            watchAriaLabel: 'Filme und Serien',
            listenAriaLabel: 'Musik',
            libraryAriaLabel: 'Bilder, Dokumente und Archive',
            communityAriaLabel: 'Stormi Community-Bereich',
            localPlayerAriaLabel: 'Lokale Dateien ohne Upload abspielen',
            profileAriaLabel: 'Mein Konto und Einstellungen',
            menuOpenAriaLabel: 'Navigationsmenü öffnen',
            menuCloseAriaLabel: 'Navigationsmenü schließen'
        },
        localPlayer: {
            title: 'Lokaler Player',
            subtitle: 'Fügen Sie Audio- oder Videodateien von Ihrem Gerät hinzu, um sie nacheinander abzuspielen.',
            dropZone: 'Dateien hierher ziehen und ablegen',
            dropZoneOr: 'oder',
            browse: 'Durchsuchen',
            play: 'Wiedergabe starten',
            remove: 'Entfernen',
            emptyState: 'Keine Dateien ausgewählt',
            emptyStateHint: 'Fügen Sie Audio- oder Videospuren hinzu, um eine Playlist zu erstellen.',
            acceptedFormats: 'Audio und Video (MP3, WAV, MP4, WebM, etc.)',
            playlistCount: 'Playlist ({count} Datei(en))'
        },
        common: {
            loading: 'Wird geladen...',
            error: 'Fehler',
            success: 'Erfolg',
            cancel: 'Abbrechen',
            confirm: 'Bestätigen',
            retry: 'Wiederholen',
            delete: 'Löschen',
            save: 'Speichern',
            close: 'Schließen',
            open: 'Öffnen',
            untitled: 'Ohne Titel',
            user: 'Benutzer',
            yes: 'Ja',
            no: 'Nein',
            unnamed: 'Ohne Namen',
            imageFallback: 'Bild',
            progression: 'Fortschritt',
            later: 'Später',
            cancelWithCountdown: 'Abbrechen ({seconds}s)'
        },
        splash: {
            loadingLong: 'Das Laden dauert länger als erwartet. Sie können es erneut versuchen.',
            loading: 'Wird geladen…',
            redirecting: 'Weiterleitung…',
            connecting: 'Verbindung…',
            ariaLabel: 'Stormi Startbildschirm'
        },
        meta: {
            pageTitleHome: 'Startseite | Stormi',
            pageTitleNotFound: 'Seite nicht gefunden | Stormi',
            pageTitleMusics: 'Musik | Stormi',
            pageTitleUpload: 'Hochladen | Stormi',
            pageTitleLibrary: 'Bibliothek | Stormi',
            pageTitleProfile: 'Profil | Stormi',
            pageTitleManageProfile: 'Profil verwalten | Stormi',
            pageTitleThemeSettings: 'Darstellung | Stormi',
            pageTitleLanguageSettings: 'Sprache | Stormi',
            pageTitleHelp: 'Hilfezentrum | Stormi',
            pageTitleCommunity: 'Community | Stormi',
            pageDescriptionHome: 'Ihr persönlicher Speicher- und Streaming-Bereich. Verwalten Sie Ihre Dateien, Statistiken und greifen Sie auf Ihre Medien zu.',
            pageDescriptionProfile: 'Verwalten Sie Ihr Stormi-Profil, Sprache und Konto.',
            pageDescriptionLibrary: 'Ihre Bilder, Dokumente, Archive und Dateien. Verwalten Sie Ihre Dateibibliothek.',
            pageDescriptionManageProfile: 'Sprache, Abmeldung und lokale Daten.',
            pageDescriptionLanguageSettings: 'Wählen Sie die Anwendungssprache.',
            pageDescriptionHelp: 'FAQ und Stormi-Support.',
            pageDescriptionCommunity: 'Stormi Community-Bereich: teilen und mit anderen Nutzern verbinden.'
        },
        community: {
            title: 'Community',
            subtitle: 'Teilen und verbinden Sie sich mit anderen Stormi-Nutzern.',
            comingSoon: 'Demnächst',
            description: 'Community-Funktionen (Diskussionen, Listen teilen, Empfehlungen) kommen bald.'
        },
        media: {
            play: 'Abspielen',
            moreInfo: 'Mehr Infos',
            addToList: 'Zu meiner Liste hinzufügen'
        },
        musics: {
            artist: 'Künstler',
            album: 'Album',
            title: 'Titel',
            unknownArtist: 'Unbekannter Künstler',
            unknownAlbum: 'Ohne Titel',
            toIdentify: 'Zu identifizieren',
            duration: 'Dauer',
            action: 'Aktion',
            albums: 'Alben',
            playAll: 'Alle abspielen',
            uploadMusicHint: 'Laden Sie Musikdateien hoch, um zu beginnen',
            trackCount: 'Track',
            trackCountPlural: 'Tracks',
            yourArtists: 'Ihre Künstler'
        },
        match: {
            loadingInfo: 'Informationen werden geladen...',
            titleDetected: 'Titel in den Metadaten erkannt',
            artistDetected: 'Künstler erkannt',
            artistDetectedInMetadata: 'Künstler in Metadaten erkannt',
            fileLabel: 'Datei',
            identifyTrack: 'Diesen Track identifizieren',
            identifyMovie: 'Diesen Film/Serie identifizieren',
            step1Artist: 'Künstler wählen',
            step2Title: 'Titel eingeben',
            searchArtistTitle: 'Künstler suchen',
            artistPlaceholder: 'Künstlername...',
            searchButton: 'Suchen',
            searching: 'Suche...',
            selectedArtistLabel: 'Ausgewählter Künstler',
            songTitlePlaceholder: 'Songtitel...',
            loadingAlbums: 'Alben werden geladen...',
            viewAllAlbums: 'Alle Alben von anzeigen',
            searchMovieOrShow: 'Film oder Serie suchen',
            fileNotFound: 'Datei nicht gefunden',
            searchArtistsError: 'Künstler können nicht gesucht werden. Überprüfen Sie Ihre Verbindung oder versuchen Sie es erneut.',
            searchAlbumsError: 'Alben können nicht gesucht werden. Überprüfen Sie Ihre Verbindung oder versuchen Sie es erneut.',
            loadAlbumsError: 'Alben können nicht geladen werden. Überprüfen Sie Ihre Verbindung oder versuchen Sie es erneut.',
            searchMoviesError: 'Filme/Serien können nicht gesucht werden. Überprüfen Sie Ihre Verbindung oder versuchen Sie es erneut.',
            pleaseEnterTitle: 'Bitte geben Sie einen Titel ein',
            pleaseSelectArtist: 'Bitte wählen Sie einen Künstler',
            pleaseSelectMovie: 'Bitte wählen Sie einen Film oder eine Serie',
            allAlbumsBy: 'Alle Alben von',
            albumsContaining: 'Alben mit',
            movieOrShowPlaceholder: 'Titel des Films oder der Serie...',
            selectArtist: 'Auswählen',
            selectMatch: 'Auswählen',
            selectAlbum: 'Auswählen',
            deselectAlbum: 'Abwählen',
            step4Confirm: '4. Bestätigen',
            confirmSelection: 'Auswahl bestätigen',
            saving: 'Wird gespeichert...',
            cancelAndReturn: 'Abbrechen und zu den Dateien zurückkehren',
            titleFallback: 'Titel'
        },
        player: {
            dismissRestore: 'Wiederherstellung ablehnen',
            resumePlayback: 'Wiedergabe fortsetzen',
            previousTrack: 'Vorheriger Track',
            nextTrack: 'Nächster Track',
            pause: 'Pause',
            play: 'Abspielen',
            closePlayer: 'Player schließen',
            miniPlayer: 'Mini-Player'
        },
        carousel: {
            scrollLeft: 'Nach links scrollen',
            scrollRight: 'Nach rechts scrollen'
        },
        actions: {
            select: 'Auswählen',
            deselect: 'Abwählen',
            view: 'Ansehen',
            open: 'Öffnen',
            identify: 'Identifizieren',
            backToList: 'Zurück zur Liste',
            viewAlbumsBy: 'Alben von anzeigen',
            viewTracksOf: 'Tracks von anzeigen',
            playTrack: 'Abspielen',
            identifyTrack: 'Identifizieren',
            viewImage: 'Bildvorschau',
            thisImage: 'dieses Bild',
            thisFile: 'diese Datei',
            thisDocument: 'dieses Dokument',
            thisArchive: 'dieses Archiv',
            thisExecutable: 'diese ausführbare Datei',
            thisMovie: 'dieser Film',
            thisShow: 'diese Serie',
            playMovie: 'Film abspielen',
            playSeries: 'Serie abspielen',
            playEpisode: 'Episode abspielen'
        },
        info: {
            myList: 'Meine Liste'
        },
        viewer: {
            previewImage: 'Bildvorschau',
            closePreview: 'Vorschau schließen'
        },
        loading: {
            pageLoad: 'Seite wird geladen'
        },
        toast: {
            closeHint: 'Klicken oder Enter drücken zum Schließen',
            close: 'Benachrichtigung schließen'
        },
        rating: {
            rateStars: 'Stern bewerten',
            rateStarsPlural: 'Sterne bewerten',
            clickToRate: 'Klicken zum Bewerten',
            yourRating: 'Ihre Bewertung',
            averageRating: 'Durchschnittsbewertung'
        },
        pdf: {
            previewUnavailable: 'Vorschau nicht verfügbar'
        },
        language: {
            selectLanguage: 'Sprache auswählen',
            title: 'Sprache',
            subtitle: 'Wählen Sie die Anwendungssprache. Ihre Wahl wird für dieses Konto gespeichert.',
            backToManageProfile: 'Zurück zu Profil verwalten'
        },
        login: {
            title: 'Stormi',
            subtitle: 'Melden Sie sich an, um auf Ihren Bereich zuzugreifen',
            connectWithGoogle: 'Mit Google anmelden:',
            electronMode: 'Electron-Modus aktiv - Die Authentifizierung wird in einem Electron-Fenster geöffnet',
            terms: 'Durch die Anmeldung stimmen Sie unseren Nutzungsbedingungen und unserer Datenschutzrichtlinie zu.',
            configError: 'Konfigurationsfehler',
            configUnavailable: 'Konfiguration nicht verfügbar. Bitte versuchen Sie es später erneut.',
            googleAuthError: 'Fehler bei der Google-Authentifizierung',
            configErrorDetail: 'GOOGLE_CLIENT_ID nicht in Cloudflare konfiguriert. Bitte konfigurieren Sie Ihre Anwendung.'
        },
        home: {
            title: 'Dashboard',
            welcome: 'Willkommen in Ihrem persönlichen Bereich, {name}',
            stats: 'Statistiken',
            statsDescription: 'Überblick über Ihre Aktivität',
            fileCount: 'Anzahl der Dateien',
            totalSize: 'GB hochgeladen',
            billing: 'Zu zahlender Betrag',
            billingDescription: 'Monatliche Abrechnung',
            amountToPay: 'Zu zahlender Betrag',
            monthlyBilling: 'Monatliche Abrechnung',
            for: 'für',
            rate: 'Satz: $0.030/GB-Monat (aufgerundet)',
            emptyTitle: 'Willkommen! Fügen Sie Ihre ersten Medien hinzu',
            emptyDescription: 'Beginnen Sie mit dem Hinzufügen Ihrer Medien, um Ihren Speicher- und Streaming-Bereich zu nutzen.',
            uploadFirst: 'Medien hinzufügen',
            continueWatching: 'Weiterschauen',
            recentlyAdded: 'Kürzlich hinzugefügt',
            showStats: 'Statistiken anzeigen',
            hideStats: 'Statistiken ausblenden',
            spaceVideos: 'Videos',
            spaceMusics: 'Musik',
            spaceLibrary: 'Bibliothek',
            spaceAdd: 'Hinzufügen',
            seeAllVideos: 'Filme & Serien ansehen',
            seeAllMusics: 'Meine Musik hören',
            addMore: 'Weitere hinzufügen',
            emptyHint: 'Ihre Dateien erscheinen hier nach dem Hinzufügen.'
        },
        upload: {
            title: 'Upload-Manager',
            selectFile: 'Datei auswählen',
            dragDrop: 'Ziehen Sie Ihre Datei hierher',
            dragDropOr: 'oder klicken Sie, um Ihre Dateien zu durchsuchen',
            supportedFormats: 'Unterstützte Formate: Bilder, Videos, Dokumente (max. 100MB)',
            globalProgress: 'Gesamtfortschritt',
            filesCompleted: 'Dateien abgeschlossen',
            inProgress: 'in Bearbeitung',
            totalSpeed: 'Gesamtgeschwindigkeit',
            timeRemaining: 'Verbleibende Zeit',
            uploaded: 'Hochgeladen',
            showDetails: 'Details anzeigen',
            hideDetails: 'Details ausblenden',
            pause: 'Pause',
            resume: 'Fortsetzen',
            cancel: 'Abbrechen',
            completed: 'Abgeschlossen',
            error: 'Fehler',
            noUploads: 'Keine Uploads in Bearbeitung',
            status: 'Status',
            size: 'Größe',
            speed: 'Geschwindigkeit',
            remainingTime: 'Verbleibende Zeit',
            successMessage: 'Datei erfolgreich hinzugefügt',
            nextStep: 'Nächster Schritt',
            viewHome: 'Zu meiner Startseite',
            viewLibrary: 'Bibliothek anzeigen',
            addAnother: 'Weitere Datei hinzufügen',
            nextStepHint: 'Wohin möchten Sie gehen?',
            uploadButton: 'Hochladen',
            filesWillAppearHere: 'Die von Ihnen hinzugefügten Dateien erscheinen hier',
            fileUploaded: 'Datei hochgeladen',
            filesUploaded: 'Dateien hochgeladen',
            fast: 'Schnell',
            fastDescription: 'Optimierter Upload mit Echtzeit-Fortschritt',
            secure: 'Sicher',
            secureDescription: 'Alle Uploads sind authentifiziert und geschützt',
            cloudflareStorage: 'Cloudflare-Speicher',
            cloudflareStorageDescription: 'Ihre Dateien werden auf Cloudflare R2 gespeichert',
            spaceUsed: 'Verwendeter Speicher',
            unlimited: 'Unbegrenzt'
        },
        localPlayerMeta: {
            pageTitle: 'Lokaler Player | Stormi',
            pageDescription: 'Spielen Sie Audio- und Videodateien von Ihrem Gerät in Folge ab.'
        },
        footer: {
            allRightsReserved: 'Alle Rechte vorbehalten'
        },
        notFound: {
            title: 'Seite nicht gefunden',
            description: 'Diese Seite existiert nicht oder wurde verschoben.',
            backHome: 'Zurück zur Startseite',
            addFiles: 'Dateien hinzufügen'
        },
        videos: {
            films: 'Filme',
            series: 'Serien',
            unidentifiedFiles: 'Zu identifizierende Dateien',
            myVideos: 'Meine Videos',
            myFilms: 'Meine Filme',
            mySeries: 'Meine Serien',
            clickToIdentify: 'Klicken Sie zum Identifizieren',
            tvShows: 'TV-Serien',
            collections: 'Sammlungen',
            film: 'Film',
            season: 'Staffel',
            episode: 'Episode',
            recentlyAdded: 'Kürzlich hinzugefügt',
            redirectToFilms: 'Weiterleitung zu Filmen',
            top10: 'Top 10 - Beste Bewertungen'
        },
        categories: {
            videos: 'Videos',
            musics: 'Musik',
            images: 'Bilder',
            documents: 'Dokumente',
            archives: 'Archive',
            executables: 'Ausführbare Dateien',
            others: 'Andere Dateien',
            videosHint: 'Filme, Serien und Videos',
            musicsHint: 'Audiotracks und Alben',
            imagesHint: 'Fotos und Bilder',
            documentsHint: 'PDF und Dokumente',
            archivesHint: 'ZIP, RAR und Archive',
            executablesHint: 'Programme und Ausführbare',
            othersHint: 'Andere Dateitypen'
        },
        emptyStates: {
            noVideos: 'Keine Videos',
            noVideosDescription: 'Beginnen Sie, Ihre Videobibliothek aufzubauen',
            uploadFirstVideo: '📤 Laden Sie Ihr erstes Video hoch',
            noFilms: 'Keine Filme',
            noFilmsDescription: 'Laden Sie Ihre Filme hoch, um sie Ihrer Sammlung hinzuzufügen',
            uploadFirstFilm: '📤 Laden Sie Ihren ersten Film hoch',
            noSeries: 'Keine Serien',
            noSeriesDescription: 'Laden Sie Ihre TV-Serien-Episoden hoch',
            uploadFirstSeries: '📤 Laden Sie Ihre erste Serie hoch',
            noMusics: 'Keine Musik',
            noMusicsDescription: 'Beginnen Sie, Ihre Musiksammlung aufzubauen',
            uploadFirstMusic: '📤 Laden Sie Ihre erste Musik hoch',
            noImages: 'Keine Bilder',
            noImagesDescription: 'Beginnen Sie, Ihre Bildgalerie aufzubauen',
            uploadFirstImage: '📤 Laden Sie Ihr erstes Bild hoch',
            noDocuments: 'Keine Dokumente',
            noDocumentsDescription: 'Beginnen Sie, Ihre Dokumente zu organisieren',
            uploadFirstDocument: '📤 Laden Sie Ihr erstes Dokument hoch',
            noArchives: 'Keine Archive',
            noArchivesDescription: 'Beginnen Sie, Ihre Archivdateien zu organisieren',
            uploadFirstArchive: '📤 Laden Sie Ihr erstes Archiv hoch',
            noExecutables: 'Keine ausführbaren Dateien',
            noExecutablesDescription: 'Organisieren Sie Ihre ausführbaren Dateien',
            uploadFirstExecutable: '📤 Laden Sie Ihre erste ausführbare Datei hoch',
            noOthers: 'Keine anderen Dateien',
            noOthersDescription: 'Dateien, die keiner Kategorie entsprechen, werden hier angezeigt',
            uploadFile: '📤 Laden Sie eine Datei hoch'
        },
        profile: {
            title: 'Mein Profil',
            subtitle: 'Verwalten Sie Ihre persönlichen Informationen und Einstellungen',
            language: 'Sprache',
            languageDescription: 'Wählen Sie Ihre bevorzugte Sprache',
            emailVerified: 'E-Mail verifiziert',
            emailNotVerified: 'E-Mail nicht verifiziert',
            personalInfo: 'Persönliche Informationen',
            fullName: 'Vollständiger Name',
            notSpecified: 'Nicht angegeben',
            emailLabel: 'E-Mail',
            verificationStatus: 'Verifizierungsstatus',
            userId: 'Benutzer-ID',
            idLabel: 'ID',
            emailVerifiedLabel: 'E-Mail verifiziert',
            connectedAccount: 'Verbundenes Konto',
            googleAccount: 'Google-Konto',
            connectedViaGoogle: 'Verbunden über Google OAuth',
            accountSecureHint: 'Ihr Konto ist durch die Google-Authentifizierung gesichert. Um Ihre Daten zu ändern, aktualisieren Sie diese bitte direkt in Ihrem Google-Konto.',
            actions: 'Aktionen',
            logout: 'Abmelden',
            clearLocalData: 'Lokale Daten löschen',
            confirmClearLocalData: 'Sind Sie sicher, dass Sie alle lokalen Daten löschen möchten?',
            logoutNote: 'Die Abmeldung entfernt Ihre aktuelle Sitzung, löscht aber nicht Ihr Konto. Um Ihr Konto dauerhaft zu löschen, gehen Sie bitte zu Ihrem Google-Konto.',
            noteLabel: 'Hinweis:'
        },
        profileMenu: {
            manageProfile: 'Profil verwalten',
            account: 'Konto',
            helpCenter: 'Hilfezentrum'
        },
        manageProfile: {
            title: 'Profil verwalten',
            subtitle: 'Sprache, Abmeldung und lokale Daten.',
            backToAccount: 'Zurück zum Konto'
        },
        theme: {
            title: 'Darstellung',
            subtitle: 'Wählen Sie das Anwendungsthema. Ihre Wahl wird für dieses Konto gespeichert.',
            appearance: 'Thema',
            light: 'Hell',
            dark: 'Dunkel',
            grey: 'Grau',
            saved: 'Thema gespeichert',
            backToManageProfile: 'Zurück zu Profil verwalten',
            customThemes: 'Benutzerdefinierte Themen',
            addCustom: 'Thema hinzufügen',
            themeName: 'Themenname',
            themeNamePlaceholder: 'z. B. Mein Blau',
            color: 'Farbe',
            maxReached: 'Maximal 10 benutzerdefinierte Themen. Löschen Sie eines, um ein neues hinzuzufügen.',
            delete: 'Löschen',
            deleteConfirm: 'Thema « {name} » löschen?',
            apply: 'Anwenden',
            customThemeDeleted: 'Thema gelöscht'
        },
        help: {
            title: 'Hilfezentrum',
            subtitle: 'Häufig gestellte Fragen und Support.',
            faqTitle: 'Häufig gestellte Fragen',
            faqUpload: 'Wie füge ich Dateien hinzu?',
            faqUploadAnswer: 'Nutzen Sie das Menü « Hinzufügen », um Medien hochzuladen. Audio-, Video-, Bild- und Dokumentformate werden unterstützt.',
            faqStorage: 'Wo werden meine Daten gespeichert?',
            faqStorageAnswer: 'Ihre Dateien werden sicher auf der Stormi-Infrastruktur (Cloudflare R2) gehostet. Sie behalten den Zugriff, solange Ihr Konto aktiv ist.',
            contactTitle: 'Kontakt',
            contactText: 'Bei Fragen wenden Sie sich an den Stormi-Support.'
        },
        dialogs: {
            logoutTitle: 'Abmelden',
            logoutMessage: 'Sind Sie sicher, dass Sie sich abmelden möchten?'
        },
        errors: {
            fetchFailed: 'Daten konnten nicht abgerufen werden',
            unknown: 'Ein unerwarteter Fehler ist aufgetreten',
            networkError: 'Serververbindungsfehler',
            statsLoadFailed: 'Statistiken konnten nicht geladen werden',
            authFailed: 'Authentifizierung fehlgeschlagen',
            saveFailed: 'Speichern nicht möglich',
            deleteFailed: 'Löschen nicht möglich',
            loadFailed: 'Datei konnte nicht geladen werden',
            title: 'Fehler',
            retry: 'Erneut versuchen',
            fetchFilesFailed: 'Fehler beim Abrufen der Dateien',
            errorWithStatus: 'Fehler {status}',
            saveFailedTryAgain: 'Fehler beim Speichern. Bitte versuchen Sie es erneut.'
        }
    }
};

/**
 * Détecte la langue de l'utilisateur
 */
export function detectLanguage(): Language {
    // Vérifier d'abord qu'on est côté client
    if (typeof window === 'undefined') {
        return 'fr'; // Fallback pour SSR
    }

    // 1. Vérifier localStorage (préférence utilisateur)
    try {
        const stored = localStorage.getItem('stormi_language');
        if (stored && (stored === 'fr' || stored === 'en' || stored === 'es' || stored === 'de')) {
            return stored as Language;
        }
    } catch (e) {
        // localStorage peut être indisponible dans certains contextes
    }

    // 2. Détecter depuis navigator.language ou navigator.languages
    if (typeof navigator !== 'undefined' && navigator.language) {
        const browserLang = navigator.language.toLowerCase();
        
        // Correspondance directe
        if (browserLang.startsWith('fr')) return 'fr';
        if (browserLang.startsWith('en')) return 'en';
        if (browserLang.startsWith('es')) return 'es';
        if (browserLang.startsWith('de')) return 'de';
        
        // Vérifier navigator.languages pour plus de précision
        if (typeof navigator !== 'undefined' && navigator.languages) {
            for (const lang of navigator.languages) {
                const langCode = lang.toLowerCase();
                if (langCode.startsWith('fr')) return 'fr';
                if (langCode.startsWith('en')) return 'en';
                if (langCode.startsWith('es')) return 'es';
                if (langCode.startsWith('de')) return 'de';
            }
        }
    }

    // 3. Détecter depuis le fuseau horaire
    if (typeof Intl !== 'undefined') {
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const tzLang = timezone.toLowerCase();
            
            // Correspondances approximatives fuseau horaire -> langue
            if (tzLang.includes('paris') || tzLang.includes('france') || tzLang.includes('brussels')) {
                return 'fr';
            }
            if (tzLang.includes('london') || tzLang.includes('new_york') || tzLang.includes('los_angeles')) {
                return 'en';
            }
            if (tzLang.includes('madrid') || tzLang.includes('mexico') || tzLang.includes('bogota')) {
                return 'es';
            }
            if (tzLang.includes('berlin') || tzLang.includes('vienna') || tzLang.includes('zurich')) {
                return 'de';
            }
        } catch (e) {
            // Ignorer les erreurs
        }
    }

    // 4. Détecter depuis l'heure locale (format de date)
    try {
        const dateFormatter = new Intl.DateTimeFormat(undefined, {
            hour: 'numeric',
            hour12: false
        });
        const formatParts = dateFormatter.formatToParts(new Date());
        
        // Les pays francophones utilisent généralement 24h
        // Les pays anglophones utilisent 12h
        // (Approximation grossière, mais c'est mieux que rien)
    } catch (e) {
        // Ignorer les erreurs
    }

    // 5. Fallback par défaut : français
    return 'fr';
}

/**
 * Obtient une traduction
 */
export function t(key: string, translations: Translations): any {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return key; // Retourner la clé si la traduction n'existe pas
        }
    }
    
    return value;
}

/**
 * Remplace les placeholders dans une chaîne
 */
export function replacePlaceholders(str: string, replacements: Record<string, string>): string {
    let result = str;
    for (const [key, value] of Object.entries(replacements)) {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return result;
}

export { translations };
