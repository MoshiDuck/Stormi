class FileItem {
  final String fileId;
  final String category;
  final String? filename;
  final int? size;
  final int? uploadedAt;
  final String? thumbnailUrl;
  final String? thumbnailR2Path;
  final String? backdropUrl;
  final String? title;
  final int? year;
  final int? duration;
  final int? season;
  final int? episode;
  final String? genres;
  final String? description;
  final String? artists;
  final String? albums;
  final String? albumThumbnails;
  final String? mimeType;

  const FileItem({
    required this.fileId,
    required this.category,
    this.filename,
    this.size,
    this.uploadedAt,
    this.thumbnailUrl,
    this.thumbnailR2Path,
    this.backdropUrl,
    this.title,
    this.year,
    this.duration,
    this.season,
    this.episode,
    this.genres,
    this.description,
    this.artists,
    this.albums,
    this.albumThumbnails,
    this.mimeType,
  });

  factory FileItem.fromJson(Map<String, dynamic> json) {
    return FileItem(
      fileId: json['file_id'] as String,
      category: json['category'] as String,
      filename: json['filename'] as String?,
      size: (json['size'] as num?)?.toInt(),
      uploadedAt: (json['uploaded_at'] as num?)?.toInt(),
      thumbnailUrl: json['thumbnail_url'] as String?,
      thumbnailR2Path: json['thumbnail_r2_path'] as String?,
      backdropUrl: json['backdrop_url'] as String?,
      title: json['title'] as String?,
      year: (json['year'] as num?)?.toInt(),
      duration: (json['duration'] as num?)?.toInt(),
      season: (json['season'] as num?)?.toInt(),
      episode: (json['episode'] as num?)?.toInt(),
      genres: json['genres'] as String?,
      description: json['description'] as String?,
      artists: json['artists'] as String?,
      albums: json['albums'] as String?,
      albumThumbnails: json['album_thumbnails'] as String?,
      mimeType: json['mime_type'] as String?,
    );
  }

  String get displayTitle => title?.trim().isNotEmpty == true ? title! : (filename ?? fileId);
}
