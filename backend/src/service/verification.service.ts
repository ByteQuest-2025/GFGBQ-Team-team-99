import { extractClaims } from "./claim.service";
import { verifyClaim } from "./citation.service";
import { calculateTrustScore } from "./scoring.service";
import { VerificationResult } from "../model/VerificationResult";

const analyze = async (text: string) => {
  const claims = await extractClaims(text);

  const verifiedClaims = await Promise.all(
    claims.map(async (c, idx) => ({
      id: `c${idx + 1}`,
      text: c,
      ...(await verifyClaim(c))
    }))
  );

  const scoreResult = calculateTrustScore(verifiedClaims);

  const verifiedText = verifiedClaims
    .filter((c) => c.status === "VERIFIED")
    .map((c) => c.text)
    .join(". ");

  const saved = await VerificationResult.create({
    originalText: text,
    trustScore: scoreResult.score,
    label: scoreResult.label,
    claims: verifiedClaims,
    verifiedText
  });

  return {
    analysisId: saved._id,
    trustScore: scoreResult.score,
    label: scoreResult.label,
    summary: `${verifiedClaims.length} claims analyzed`
  };
};

const getClaims = async (id: string) => {
  const result = await VerificationResult.findById(id);
  if (!result) throw new Error("not_found");
  return result.claims;
};

const getEvidence = async (claimId: string) => {
  // For demo: claim IDs are simple like "c1", "c2"
  // In production you'd index claims separately
  const allResults = await VerificationResult.find().limit(50);
  
  for (const result of allResults) {
    const claim = (result.claims as any[]).find((c: any) => c.id === claimId);
    if (claim) {
      return {
        claimId: claim.id,
        status: claim.status,
        evidence: claim.evidence,
        citationCheck: {
          exists: claim.evidence.length > 0,
          valid: claim.status === "VERIFIED",
          reason:
            claim.status === "VERIFIED"
              ? "Citation matches supporting source"
              : "Citation missing or contradicted"
        }
      };
    }
  }
  
  throw new Error("not_found");
};

const getVerifiedText = async (id: string) => {
  const result = await VerificationResult.findById(id);
  if (!result) throw new Error("not_found");

  const removedClaims = (result.claims as any[])
    .filter((c: any) => c.status !== "VERIFIED")
    .map((c: any) => c.text);

  return {
    verifiedText: result.verifiedText,
    removedClaims
  };
};

export const verificationService = {
  analyze,
  getClaims,
  getEvidence,
  getVerifiedText
};
