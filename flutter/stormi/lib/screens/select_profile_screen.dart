import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/streaming_profile.dart';
import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';
import '../utils/responsive.dart';

/// Sélection du profil (qui regarde) — portrait du site /select-profile.
class SelectProfileScreen extends StatefulWidget {
  const SelectProfileScreen({super.key});

  @override
  State<SelectProfileScreen> createState() => _SelectProfileScreenState();
}

class _SelectProfileScreenState extends State<SelectProfileScreen> {
  List<StreamingProfile> _profiles = [];
  bool _loading = true;
  String? _error;
  bool _editMode = false;

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

  void _onSelectProfile(StreamingProfile profile) {
    if (_editMode) return;
    context.read<AuthService>().setActiveProfile(profile.id);
  }

  Future<void> _onReorder(int oldIndex, int newIndex) async {
    if (newIndex > oldIndex) newIndex--;
    final reordered = List<StreamingProfile>.from(_profiles);
    final item = reordered.removeAt(oldIndex);
    reordered.insert(newIndex, item);
    setState(() => _profiles = reordered);
    try {
      await context.read<ApiClient>().reorderProfiles(reordered.map((p) => p.id).toList());
    } catch (e) {
      if (mounted) {
        setState(() => _profiles = List.from(_profiles));
        _loadProfiles();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${context.read<LanguageProvider>().t('common.error')}: $e'), backgroundColor: Theme.of(context).colorScheme.errorContainer),
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
        content: SingleChildScrollView(
          child: TextField(
            controller: nameController,
            decoration: InputDecoration(
              labelText: lang.t('selectProfile.createPlaceholder'),
              border: const OutlineInputBorder(),
            ),
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
          decoration: InputDecoration(
            labelText: 'PIN',
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
      await context.read<ApiClient>().patchProfile(id, name: name, pin: pin);
      await _loadProfiles();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(lang.t('common.save'))));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${lang.t('common.error')}: $e'), backgroundColor: Theme.of(context).colorScheme.errorContainer),
      );
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
          decoration: InputDecoration(
            labelText: 'PIN',
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
      context.read<AuthService>().clearActiveProfile();
      await _loadProfiles();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(lang.t('selectProfile.delete'))));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${lang.t('common.error')}: $e'), backgroundColor: Theme.of(context).colorScheme.errorContainer),
      );
    }
  }

  Future<void> _createProfile(String name, bool isChild) async {
    final lang = context.read<LanguageProvider>();
    final displayName = isChild ? lang.t('selectProfile.profileTypeChild') : name.trim();
    if (displayName.isEmpty) return;
    try {
      final api = context.read<ApiClient>();
      await api.postProfile(name: displayName, isChild: isChild);
      await _loadProfiles();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${lang.t('common.error')}: ${e.toString()}'),
            backgroundColor: Theme.of(context).colorScheme.errorContainer,
          ),
        );
      }
    }
  }

  void _openAddProfileDialog() {
    final theme = context.read<ThemeProvider>();
    final lang = context.read<LanguageProvider>();
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
                  Text(lang.t('selectProfile.profileTypeAdult') + ' / ' + lang.t('selectProfile.profileTypeChild'), style: TextStyle(fontSize: r.sp(13))),
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

  @override
  Widget build(BuildContext context) {
    final theme = context.watch<ThemeProvider>();
    final lang = context.watch<LanguageProvider>();
    final colorScheme = theme.themeData.colorScheme;
    final r = Responsive.of(context);
    final avatarSize = r.wp(22).clamp(80.0, 140.0).toDouble();

    if (_loading && _profiles.isEmpty) {
      return Scaffold(
        backgroundColor: theme.themeData.scaffoldBackgroundColor,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(color: colorScheme.primary),
              SizedBox(height: r.gap),
              Text(
                lang.t('selectProfile.loading'),
                style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.8), fontSize: r.sp(14)),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: theme.themeData.scaffoldBackgroundColor,
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(r.padH),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                lang.t('selectProfile.whoIsWatching'),
                style: TextStyle(
                  color: colorScheme.onSurface,
                  fontSize: r.sp(26),
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: r.gapS),
              Text(
                lang.t('selectProfile.subtitle'),
                style: TextStyle(
                  color: colorScheme.onSurface.withValues(alpha: 0.7),
                  fontSize: r.sp(15),
                ),
                textAlign: TextAlign.center,
              ),
              if (_error != null) ...[
                SizedBox(height: r.gap),
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: r.padH),
                  child: Text(
                    _error!,
                    style: TextStyle(color: colorScheme.error, fontSize: r.sp(13)),
                    textAlign: TextAlign.center,
                  ),
                ),
                SizedBox(height: r.gapS),
                FilledButton(
                  onPressed: _loadProfiles,
                  child: Text(lang.t('common.retry')),
                ),
              ] else ...[
                SizedBox(height: r.padV),
                Expanded(
                  child: _editMode
                      ? Column(
                          children: [
                            Expanded(
                              child: ReorderableListView(
                                buildDefaultDragHandles: true,
                                onReorder: (oldIndex, newIndex) {
                                  if (newIndex > oldIndex) newIndex--;
                                  _onReorder(oldIndex, newIndex);
                                },
                                proxyDecorator: (child, index, animation) => Material(
                                  elevation: 6,
                                  color: theme.themeData.colorScheme.surfaceContainerHighest,
                                  borderRadius: BorderRadius.circular(r.radius),
                                  child: child,
                                ),
                                children: _profiles
                                    .map((profile) => KeyedSubtree(
                                          key: ValueKey(profile.id),
                                          child: _ProfileCard(
                                            context,
                                            profile: profile,
                                          avatarSize: avatarSize,
                                          colorScheme: colorScheme,
                                          lang: lang,
                                          editMode: true,
                                          onTap: () => _onSelectProfile(profile),
                                          onEdit: () => _openEditProfileDialog(profile),
                                          onDelete: profile.isMain ? null : () => _confirmDeleteProfile(profile),
                                          ),
                                        ))
                                    .toList(),
                              ),
                            ),
                            _AddProfileCard(
                              context,
                              avatarSize: avatarSize,
                              colorScheme: colorScheme,
                              lang: lang,
                              onTap: _openAddProfileDialog,
                            ),
                            SizedBox(height: r.gap),
                          ],
                        )
                      : SingleChildScrollView(
                          child: Wrap(
                            alignment: WrapAlignment.center,
                            spacing: r.gap,
                            runSpacing: r.gap,
                            children: [
                              ..._profiles.map((profile) => _ProfileCard(
                                    context,
                                    profile: profile,
                                    avatarSize: avatarSize,
                                    colorScheme: colorScheme,
                                    lang: lang,
                                    editMode: false,
                                    onTap: () => _onSelectProfile(profile),
                                    onEdit: null,
                                    onDelete: null,
                                  )),
                              _AddProfileCard(
                                context,
                                avatarSize: avatarSize,
                                colorScheme: colorScheme,
                                lang: lang,
                                onTap: _openAddProfileDialog,
                              ),
                            ],
                          ),
                        ),
                ),
                SizedBox(height: r.padV),
                TextButton(
                  onPressed: () => setState(() => _editMode = !_editMode),
                  child: Text(
                    _editMode ? lang.t('common.close') : lang.t('selectProfile.editProfiles'),
                    style: TextStyle(fontSize: r.sp(14)),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

Widget _ProfileCard(
  BuildContext context, {
  required StreamingProfile profile,
  required double avatarSize,
  required ColorScheme colorScheme,
  required LanguageProvider lang,
  required bool editMode,
  required VoidCallback onTap,
  VoidCallback? onEdit,
  VoidCallback? onDelete,
}) {
  final r = Responsive.of(context);
  final card = Column(
    mainAxisSize: MainAxisSize.min,
    children: [
      InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(r.radius),
        child: Column(
          children: [
            Container(
              width: avatarSize,
              height: avatarSize,
              decoration: BoxDecoration(
                color: colorScheme.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(r.radius * 0.8),
                border: Border.all(
                  color: editMode ? colorScheme.outline : colorScheme.primary.withValues(alpha: 0.5),
                  width: 2,
                ),
              ),
              child: profile.avatarUrl != null && profile.avatarUrl!.isNotEmpty
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(r.radius * 0.8),
                      child: Image.network(
                        profile.avatarUrl!,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Center(
                          child: Text(
                            (profile.name.isNotEmpty ? profile.name[0] : '?').toUpperCase(),
                            style: TextStyle(fontSize: r.sp(28), fontWeight: FontWeight.w600, color: colorScheme.onSurface),
                          ),
                        ),
                      ),
                    )
                  : Center(
                      child: Text(
                        (profile.name.isNotEmpty ? profile.name[0] : '?').toUpperCase(),
                        style: TextStyle(fontSize: r.sp(28), fontWeight: FontWeight.w600, color: colorScheme.onSurface),
                      ),
                    ),
            ),
            if (profile.isMain)
              Container(
                margin: EdgeInsets.only(top: 4),
                padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: colorScheme.primary.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  lang.t('selectProfile.mainProfileBadge'),
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: colorScheme.primary),
                ),
              ),
            SizedBox(height: r.gapS),
            SizedBox(
              width: avatarSize + 24,
              child: Text(
                profile.name,
                style: TextStyle(
                  color: colorScheme.onSurface,
                  fontSize: r.sp(14),
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
      if (editMode && (onEdit != null || onDelete != null))
        Padding(
          padding: EdgeInsets.only(top: r.gapS),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (onEdit != null)
                TextButton(
                  onPressed: onEdit,
                  child: Text(lang.t('selectProfile.edit'), style: TextStyle(fontSize: r.sp(12))),
                ),
              if (onDelete != null)
                TextButton(
                  onPressed: onDelete,
                  child: Text(lang.t('selectProfile.delete'), style: TextStyle(fontSize: r.sp(12), color: colorScheme.error)),
                ),
            ],
          ),
        ),
    ],
  );
  return card;
}

Widget _AddProfileCard(
  BuildContext context, {
  required double avatarSize,
  required ColorScheme colorScheme,
  required LanguageProvider lang,
  required VoidCallback onTap,
}) {
  final r = Responsive.of(context);
  return Column(
    mainAxisSize: MainAxisSize.min,
    children: [
      InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(r.radius),
        child: Column(
          children: [
            Container(
              width: avatarSize,
              height: avatarSize,
              decoration: BoxDecoration(
                border: Border.all(color: colorScheme.outline, width: 2),
                borderRadius: BorderRadius.circular(r.radius * 0.8),
              ),
              child: Icon(Icons.add, size: r.iconSize(40), color: colorScheme.onSurface.withValues(alpha: 0.6)),
            ),
            SizedBox(height: r.gapS),
            SizedBox(
              width: avatarSize + 24,
              child: Text(
                lang.t('selectProfile.addProfile'),
                style: TextStyle(
                  color: colorScheme.onSurface.withValues(alpha: 0.6),
                  fontSize: r.sp(14),
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    ],
  );
}
