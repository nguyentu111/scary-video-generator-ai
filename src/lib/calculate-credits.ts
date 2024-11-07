export function calculateVideoCredits(text: string, segmentCount: number) {
  // Calculate estimated video length in minutes
  const wordCount = text.split(/\s+/).length;
  const estimatedMinutes = (wordCount / 249) * 1.5; // 249 words = 1.5 minutes

  // Calculate credits needed
  const timeBasedCredits = Math.ceil(estimatedMinutes * 30); // 30 credits per minute
  const segmentBasedCredits = segmentCount * 20; // 20 credits per segment

  return {
    estimatedMinutes,
    timeBasedCredits,
    segmentBasedCredits,
    totalCredits: timeBasedCredits + segmentBasedCredits,
  };
}
