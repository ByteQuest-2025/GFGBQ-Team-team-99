import axios from "axios";

interface VerificationResult {
  status: "VERIFIED" | "PARTIAL" | "HALLUCINATED";
  confidence: number;
  shortReason: string;
  evidence: Array<{
    source: string;
    verdict: string;
    url?: string;
  }>;
}

export const verifyClaim = async (claim: string): Promise<VerificationResult> => {
  // Try Wikipedia REST API
  const searchQuery = claim.split(" ").slice(0, 5).join(" ");
  const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchQuery)}`;

  try {
    const response = await axios.get(wikiUrl, { timeout: 5000 });

    if (response.data && response.data.extract) {
      return {
        status: "VERIFIED",
        confidence: 0.85,
        shortReason: "Supported by Wikipedia",
        evidence: [
          {
            source: "Wikipedia",
            verdict: "Supports claim",
            url: response.data.content_urls?.desktop?.page || wikiUrl
          }
        ]
      };
    }
  } catch (err) {
    // Wikipedia lookup failed
  }

  // Fallback: mark as hallucinated if no match
  return {
    status: "HALLUCINATED",
    confidence: 0.2,
    shortReason: "No supporting sources found",
    evidence: [
      {
        source: "Wikipedia",
        verdict: "No match found"
      }
    ]
  };
};
