export const calculateTrustScore = (claims: any[]) => {
  let score = 0;

  claims.forEach((c) => {
    if (c.status === "VERIFIED") score += 1;
    else if (c.status === "PARTIAL") score += 0.5;
    else score -= 1;
  });

  const finalScore = Math.max(0, Math.min(100, (score / Math.max(1, claims.length)) * 100));

  return {
    score: Math.round(finalScore),
    label:
      finalScore > 75
        ? "High Confidence"
        : finalScore > 40
        ? "Review Recommended"
        : "High Risk"
  };
};
