class Stats {
  final int fileCount;
  final double totalSizeGB;
  final double billableGB;

  const Stats({
    required this.fileCount,
    required this.totalSizeGB,
    required this.billableGB,
  });

  factory Stats.fromJson(Map<String, dynamic> json) {
    return Stats(
      fileCount: (json['fileCount'] as num?)?.toInt() ?? 0,
      totalSizeGB: (json['totalSizeGB'] as num?)?.toDouble() ?? 0,
      billableGB: (json['billableGB'] as num?)?.toDouble() ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'fileCount': fileCount,
        'totalSizeGB': totalSizeGB,
        'billableGB': billableGB,
      };
}
