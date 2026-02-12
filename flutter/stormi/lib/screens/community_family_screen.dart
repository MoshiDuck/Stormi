import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/streaming_profile.dart';
import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';
import '../utils/responsive.dart';

/// Page Communauté > Famille — gestion des profils famille (liste, actif, ajout, modification, suppression).
class CommunityFamilyScreen extends StatefulWidget {
  const CommunityFamilyScreen({super.key});

  @override
  State<CommunityFamilyScreen> createState() => _CommunityFamilyScreenState();
}

class _CommunityFamilyScreenState extends State<CommunityFamilyScreen> {
  List<StreamingProfile> _profiles = [];
  bool _loading = true;
  String? _error;

  static const double _avatarSize = 88;
  static const double _cardMinWidth = 160;

  @override
  void initState() {
    super.initState();
    _loadProfiles();
  }

  Future<void> _loadProfiles() async {
    if (!mounted) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final api = context.read<ApiClient>();
      final list = await api.getProfiles();
      if (mounted) setState(() {
        _profiles = list;
        _loading = false;
      });
    } catch (e) {
      if (mounted) setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  void _setActiveProfile(StreamingProfile profile) {
    context.read<AuthService>().setActiveProfile(profile.id);
    setState(() {});
  }

  void _openAddProfileDialog() {
    final lang = context.read<LanguageProvider>();
    final theme = context.read<ThemeProvider>();
    final colorScheme = theme.themeData.colorScheme;
    final r = Responsive.of(context);
    String name = '';
    bool isChild = false;
    String? error;
    showDialog<void>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) {
          return AlertDialog(
            title: Text(lang.t('selectProfile.createTitle')),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TextField(
                    decoration: InputDecoration(
                      labelText: lang.t('selectProfile.createPlaceholder'),
                      border: const OutlineInputBorder(),
                    ),
                    onChanged: (v) => name = v,
                  ),
                  SizedBox(height: r.gap),
                  Text(
                    '${lang.t('selectProfile.profileTypeAdult')} / ${lang.t('selectProfile.profileTypeChild')}',
                    style: TextStyle(fontSize: r.sp(13)),
                  ),
                  Row(
                    children: [
                      ChoiceChip(
                        label: Text(lang.t('selectProfile.profileTypeAdult')),
                        selected: !isChild,
                        onSelected: (_) => setDialogState(() => isChild = false),
                      ),
                      SizedBox(width: r.gapS),
                      ChoiceChip(
                        label: Text(lang.t('selectProfile.profileTypeChild')),
                        selected: isChild,
                        onSelected: (_) => setDialogState(() => isChild = true),
                      ),
                    ],
                  ),
                  if (error != null) ...[
                    SizedBox(height: r.gapS),
                    Text(error!, style: TextStyle(color: colorScheme.error, fontSize: r.sp(12))),
                  ],
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(ctx).pop(),
                child: Text(lang.t('profile.cancel')),
              ),
              FilledButton(
                onPressed: () async {
                  final displayName = isChild ? lang.t('selectProfile.profileTypeChild') : name.trim();
                  if (displayName.isEmpty) {
                    setDialogState(() => error = lang.t('selectProfile.createPlaceholder'));
                    return;
                  }
                  Navigator.of(ctx).pop();
                  await _createProfile(displayName, isChild);
                },
                child: Text(lang.t('selectProfile.createSubmit')),
              ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _createProfile(String name, bool isChild) async {
    final lang = context.read<LanguageProvider>();
    final displayName = isChild ? lang.t('selectProfile.profileTypeChild') : name.trim();
    if (displayName.isEmpty) return;
    try {
      await context.read<ApiClient>().postProfile(name: displayName, isChild: isChild);
      await _loadProfiles();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${lang.t('common.error')}: $e'),
            backgroundColor: Theme.of(context).colorScheme.errorContainer,
          ),
        );
      }
    }
  }

  void _openEditProfileDialog(StreamingProfile profile) {
    final lang = context.read<LanguageProvider>();
    final isMain = profile.isMain;
    final nameController = TextEditingController(text: profile.name);
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(lang.t('selectProfile.edit')),
        content: TextField(
          controller: nameController,
          decoration: InputDecoration(
            labelText: lang.t('selectProfile.createPlaceholder'),
            border: const OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text(lang.t('profile.cancel')),
          ),
          FilledButton(
            onPressed: () async {
              final name = nameController.text.trim();
              if (name.isEmpty) return;
              Navigator.of(ctx).pop();
              if (isMain) {
                await _updateProfile(profile.id, name, true, null);
              } else {
                _showPinDialogForEdit(profile.id, name);
              }
            },
            child: Text(lang.t('common.save')),
          ),
        ],
      ),
    );
  }

  void _showPinDialogForEdit(String profileId, String name) {
    final lang = context.read<LanguageProvider>();
    final pinController = TextEditingController();
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(lang.t('selectProfile.pinEnterTitle')),
        content: TextField(
          controller: pinController,
          keyboardType: TextInputType.number,
          obscureText: true,
          maxLength: 4,
          decoration: const InputDecoration(
            labelText: 'PIN',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text(lang.t('profile.cancel')),
          ),
          FilledButton(
            onPressed: () async {
              final pin = pinController.text.trim();
              Navigator.of(ctx).pop();
              if (pin.length == 4) await _updateProfile(profileId, name, false, pin);
            },
            child: Text(lang.t('common.save')),
          ),
        ],
      ),
    );
  }

  Future<void> _updateProfile(String id, String name, bool isMain, String? pin) async {
    final lang = context.read<LanguageProvider>();
    try {
      final updated = await context.read<ApiClient>().patchProfile(id, name: name, pin: pin);
      await _loadProfiles();
      if (mounted && context.read<AuthService>().state.activeProfileId == id) {
        context.read<AuthService>().setActiveProfile(updated.id);
      }
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(lang.t('common.save'))));
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${lang.t('common.error')}: $e'),
            backgroundColor: Theme.of(context).colorScheme.errorContainer,
          ),
        );
      }
    }
  }

  void _confirmDeleteProfile(StreamingProfile profile) {
    final lang = context.read<LanguageProvider>();
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(lang.t('selectProfile.delete')),
        content: Text(lang.t('selectProfile.deleteConfirm')),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text(lang.t('profile.cancel')),
          ),
          FilledButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              _showPinDialogForDelete(profile.id);
            },
            style: FilledButton.styleFrom(backgroundColor: Theme.of(ctx).colorScheme.error),
            child: Text(lang.t('common.delete')),
          ),
        ],
      ),
    );
  }

  void _showPinDialogForDelete(String profileId) {
    final lang = context.read<LanguageProvider>();
    final pinController = TextEditingController();
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(lang.t('selectProfile.pinEnterTitle')),
        content: TextField(
          controller: pinController,
          keyboardType: TextInputType.number,
          obscureText: true,
          maxLength: 4,
          decoration: const InputDecoration(
            labelText: 'PIN',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text(lang.t('profile.cancel')),
          ),
          FilledButton(
            onPressed: () async {
              final pin = pinController.text.trim();
              Navigator.of(ctx).pop();
              if (pin.length == 4) await _doDeleteProfile(profileId, pin);
            },
            child: Text(lang.t('common.delete')),
          ),
        ],
      ),
    );
  }

  Future<void> _doDeleteProfile(String id, String pin) async {
    final lang = context.read<LanguageProvider>();
    try {
      await context.read<ApiClient>().deleteProfile(id, pin: pin);
      if (context.read<AuthService>().state.activeProfileId == id) {
        context.read<AuthService>().clearActiveProfile();
      }
      await _loadProfiles();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(lang.t('selectProfile.delete'))));
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${lang.t('common.error')}: $e'),
            backgroundColor: Theme.of(context).colorScheme.errorContainer,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = context.watch<ThemeProvider>();
    final lang = context.watch<LanguageProvider>();
    final auth = context.watch<AuthService>();
    final colorScheme = theme.themeData.colorScheme;
    final r = Responsive.of(context);
    final activeProfileId = auth.state.activeProfileId;

    return Scaffold(
      backgroundColor: theme.themeData.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: theme.themeData.appBarTheme.backgroundColor,
        foregroundColor: theme.themeData.appBarTheme.foregroundColor,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          lang.t('community.sectionFamilyTitle'),
          style: TextStyle(color: colorScheme.onSurface, fontSize: r.sp(18)),
        ),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(r.padH),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextButton.icon(
              onPressed: () => Navigator.of(context).pop(),
              icon: const Icon(Icons.chevron_left_rounded, size: 20),
              label: Text(lang.t('community.backToCommunity')),
              style: TextButton.styleFrom(
                foregroundColor: colorScheme.onSurfaceVariant,
              ),
            ),
            SizedBox(height: r.gapS),
            Card(
              color: colorScheme.surfaceContainerHighest,
              child: Padding(
                padding: EdgeInsets.all(r.padH),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('👨‍👩‍👧', style: TextStyle(fontSize: r.sp(36))),
                    SizedBox(height: r.gapS),
                    Text(
                      lang.t('community.sectionFamilyTitle'),
                      style: TextStyle(
                        color: colorScheme.onSurface,
                        fontSize: r.sp(24),
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(height: r.gapS * 0.5),
                    Text(
                      lang.t('community.sectionFamilySubtitle'),
                      style: TextStyle(
                        color: colorScheme.onSurfaceVariant,
                        fontSize: r.sp(15),
                        height: 1.4,
                      ),
                    ),
                    SizedBox(height: r.gapS * 0.5),
                    Text(
                      lang.t('community.sectionFamilyDescription'),
                      style: TextStyle(
                        color: colorScheme.onSurfaceVariant.withValues(alpha: 0.9),
                        fontSize: r.sp(14),
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: r.padV),
            Text(
              lang.t('community.familyProfilesTitle'),
              style: TextStyle(
                color: colorScheme.onSurface,
                fontSize: r.sp(20),
                fontWeight: FontWeight.w700,
              ),
            ),
            SizedBox(height: r.gapS * 0.5),
            Text(
              '${lang.t('selectProfile.chooseProfile')} · ${lang.t('selectProfile.editProfiles')}',
              style: TextStyle(
                color: colorScheme.onSurfaceVariant,
                fontSize: r.sp(14),
                height: 1.45,
              ),
            ),
            SizedBox(height: r.gap),
            if (_loading && _profiles.isEmpty)
              Center(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: r.padV * 2),
                  child: Column(
                    children: [
                      CircularProgressIndicator(color: colorScheme.primary),
                      SizedBox(height: r.gap),
                      Text(
                        lang.t('selectProfile.loading'),
                        style: TextStyle(color: colorScheme.onSurfaceVariant, fontSize: r.sp(14)),
                      ),
                    ],
                  ),
                ),
              )
            else if (_error != null)
              Center(
                child: Padding(
                  padding: EdgeInsets.all(r.padH),
                  child: Column(
                    children: [
                      Text(_error!, style: TextStyle(color: colorScheme.error, fontSize: r.sp(14)), textAlign: TextAlign.center),
                      SizedBox(height: r.gap),
                      FilledButton(onPressed: _loadProfiles, child: Text(lang.t('common.retry'))),
                    ],
                  ),
                ),
              )
            else
              LayoutBuilder(
                builder: (context, constraints) {
                  final maxW = constraints.hasBoundedWidth ? constraints.maxWidth : MediaQuery.of(context).size.width;
                  final crossCount = (maxW / (_cardMinWidth + r.gap)).floor().clamp(1, 4);
                  final cardWidth = (maxW - (crossCount - 1) * r.gap) / crossCount;
                  return Wrap(
                    spacing: r.gap,
                    runSpacing: r.gap,
                    children: [
                      ..._profiles.map((profile) {
                        final isActive = activeProfileId == profile.id;
                        return SizedBox(
                          width: cardWidth,
                          child: _FamilyProfileCard(
                            profile: profile,
                            isActive: isActive,
                            avatarSize: _avatarSize,
                            colorScheme: colorScheme,
                            lang: lang,
                            onTap: () => _setActiveProfile(profile),
                            onEdit: () => _openEditProfileDialog(profile),
                            onDelete: profile.isMain ? null : () => _confirmDeleteProfile(profile),
                          ),
                        );
                      }),
                      SizedBox(
                        width: cardWidth,
                        child: _FamilyAddCard(
                          avatarSize: _avatarSize,
                          colorScheme: colorScheme,
                          lang: lang,
                          onTap: _openAddProfileDialog,
                        ),
                      ),
                    ],
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}

class _FamilyProfileCard extends StatelessWidget {
  final StreamingProfile profile;
  final bool isActive;
  final double avatarSize;
  final ColorScheme colorScheme;
  final LanguageProvider lang;
  final VoidCallback onTap;
  final VoidCallback onEdit;
  final VoidCallback? onDelete;

  const _FamilyProfileCard({
    required this.profile,
    required this.isActive,
    required this.avatarSize,
    required this.colorScheme,
    required this.lang,
    required this.onTap,
    required this.onEdit,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final r = Responsive.of(context);
    return Material(
      color: colorScheme.surfaceContainerHighest,
      borderRadius: BorderRadius.circular(r.radius * 1.2),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(r.radius * 1.2),
        child: Container(
          padding: EdgeInsets.all(r.padH),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(r.radius * 1.2),
            border: Border.all(
              color: isActive ? colorScheme.primary : colorScheme.outline,
              width: isActive ? 2 : 1,
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                width: avatarSize,
                height: avatarSize,
                child: ClipOval(
                  child: profile.avatarUrl != null && profile.avatarUrl!.isNotEmpty
                      ? Image.network(
                          profile.avatarUrl!,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => _avatarPlaceholder(),
                        )
                      : _avatarPlaceholder(),
                ),
              ),
              SizedBox(height: r.gapS),
              Text(
                profile.name,
                style: TextStyle(
                  color: colorScheme.onSurface,
                  fontSize: r.sp(16),
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              if (isActive) ...[
                SizedBox(height: r.gapS * 0.5),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: colorScheme.primary,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.check_rounded, size: 12, color: colorScheme.onPrimary),
                      SizedBox(width: 4),
                      Text(
                        lang.t('selectProfile.activeBadge'),
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: colorScheme.onPrimary),
                      ),
                    ],
                  ),
                ),
              ],
              SizedBox(height: r.gapS),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton(
                    onPressed: onEdit,
                    icon: Icon(Icons.edit_rounded, size: 20, color: colorScheme.onSurfaceVariant),
                    style: IconButton.styleFrom(
                      backgroundColor: colorScheme.surfaceContainerHighest,
                      minimumSize: const Size(40, 40),
                    ),
                  ),
                  if (onDelete != null)
                    IconButton(
                      onPressed: onDelete,
                      icon: Icon(Icons.delete_outline_rounded, size: 20, color: colorScheme.error),
                      style: IconButton.styleFrom(
                        backgroundColor: colorScheme.surfaceContainerHighest,
                        minimumSize: const Size(40, 40),
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _avatarPlaceholder() {
    return Container(
      color: colorScheme.surfaceContainerHighest,
      child: Center(
        child: Text(
          (profile.name.isNotEmpty ? profile.name[0] : '?').toUpperCase(),
          style: TextStyle(fontSize: avatarSize * 0.4, fontWeight: FontWeight.w600, color: colorScheme.onSurface),
        ),
      ),
    );
  }
}

class _FamilyAddCard extends StatelessWidget {
  final double avatarSize;
  final ColorScheme colorScheme;
  final LanguageProvider lang;
  final VoidCallback onTap;

  const _FamilyAddCard({
    required this.avatarSize,
    required this.colorScheme,
    required this.lang,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final r = Responsive.of(context);
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(r.radius * 1.2),
        child: Container(
          padding: EdgeInsets.all(r.padH),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(r.radius * 1.2),
            border: Border.all(color: colorScheme.outline, width: 2, strokeAlign: BorderSide.strokeAlignInside),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SizedBox(
                width: avatarSize,
                height: avatarSize,
                child: Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: colorScheme.outline, width: 2),
                  ),
                  child: Icon(Icons.add_rounded, size: 36, color: colorScheme.onSurfaceVariant),
                ),
              ),
              SizedBox(height: r.gapS),
              Text(
                lang.t('selectProfile.addProfile'),
                style: TextStyle(
                  color: colorScheme.onSurfaceVariant,
                  fontSize: r.sp(14),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
