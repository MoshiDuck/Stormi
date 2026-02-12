class WatchProgress {
  final String fileId;
  final String userId;
  final double currentTime;
  final double duration;
  final double progressPercent;
  final int lastWatched;

  const WatchProgress({
    required this.fileId,
    required this.userId,
    required this.currentTime,
    required this.duration,
    required this.progressPercent,
    required this.lastWatched,
  });

  factory WatchProgress.fromJson(Map<String, dynamic> json) {
    return WatchProgress(
      fileId: json['file_id'] as String,
      userId: json['user_id'] as String,
      currentTime: (json['current_time'] as num?)?.toDouble() ?? 0,
      duration: (json['duration'] as num?)?.toDouble() ?? 0,
      progressPercent: (json['progress_percent'] as num?)?.toDouble() ?? 0,
      lastWatched: (json['last_watched'] as num?)?.toInt() ?? 0,
    );
  }
}
