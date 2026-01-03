export const calculateTrustScore = (claims: any[]) => {
  let score = 0;

  claims.forEach((c) => {
    if (c.status === "verified") score += 1;
    else if (c.status === "uncertain") score += 0.5;
    else score -= 0.5; // hallucinated
  });

  // Normalize to 0-100 scale
  const rawScore = (score / Math.max(1, claims.length)) * 100;
  const finalScore = Math.max(0, Math.min(100, 50 + rawScore / 2));

  return {
    score: Math.round(finalScore),
    label:
      finalScore > 75
        ? "High Confidence"
        : finalScore > 50
        ? "Moderate Confidence"
        : finalScore > 30
        ? "Review Recommended"
        : "High Risk"
  };
};
