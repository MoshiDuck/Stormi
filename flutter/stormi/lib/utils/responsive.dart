import 'package:flutter/material.dart';

/// Utilitaires responsive : dimensions en % de l'écran, tailles de texte/icônes scaleables et clampées.
/// Utiliser [Responsive.of(context)] dans le build pour accéder aux valeurs.
class Responsive {
  Responsive._(BuildContext context)
      : _context = context,
        _size = MediaQuery.sizeOf(context),
        _padding = MediaQuery.paddingOf(context);

  final BuildContext _context;
  final Size _size;
  final EdgeInsets _padding;

  static Responsive of(BuildContext context) => Responsive._(context);

  double get width => _size.width;
  double get height => _size.height;
  EdgeInsets get padding => _padding;

  /// Largeur utilisable (sans padding safe area horizontal)
  double get safeWidth => _size.width - _padding.horizontal;

  /// Hauteur utilisable (sans padding safe area vertical)
  double get safeHeight => _size.height - _padding.vertical;

  /// [percent] % de la largeur de l'écran (0–100).
  double wp(double percent) => _size.width * (percent / 100);

  /// [percent] % de la hauteur de l'écran (0–100).
  double hp(double percent) => _size.height * (percent / 100);

  /// Taille de texte scaleable à partir de la largeur, clampée pour rester lisible.
  /// [base] = taille de référence pour une largeur ~400.
  double sp(double base) {
    final scale = (_size.width / 400).clamp(0.75, 1.5);
    return (base * scale).clamp(base * 0.8, base * 1.4);
  }

  /// Taille d'icône scaleable, clampée.
  double iconSize(double base) {
    final scale = (_size.width / 400).clamp(0.8, 1.3);
    return (base * scale).roundToDouble();
  }

  /// Padding horizontal de contenu (en % largeur), clampé.
  double get padH => wp(4).clamp(12, 24).toDouble();

  /// Padding vertical de contenu (en % hauteur), clampé.
  double get padV => hp(1.5).clamp(12, 28).toDouble();

  /// Espacement entre éléments (en % largeur), clampé.
  double get gap => wp(2).clamp(8, 20).toDouble();

  /// Espacement petit.
  double get gapS => wp(1).clamp(4, 12).toDouble();

  /// Rayon de bordure standard (en % largeur), clampé.
  double get radius => wp(2).clamp(8, 16).toDouble();

  /// Hauteur max barre de navigation (en % hauteur), clampée.
  double get navBarHeight => hp(8).clamp(56, 72).toDouble();

  /// Largeur max du contenu sur tablette (pour centrer).
  double get maxContentWidth => width > 600 ? 600 : width;
}
