import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const SERP_API_KEY = process.env.SERP_API_KEY;

interface VerificationResult {
  status: "verified" | "uncertain" | "hallucinated";
  confidence: number;
  explanation: string;
  evidence: Array<{
    source: string;
    verdict: string;
    url?: string;
  }>;
}

interface EntityExtractionResult {
  mainEntity: string;
  searchTerms: string[];
}

/**
 * Extract the main entity/topic from a claim for Wikipedia lookup
 */
async function extractEntityFromClaim(claim: string): Promise<EntityExtractionResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Extract the main entity (person, place, event, concept) from this claim that would be the best Wikipedia article title to verify it.

Claim: "${claim}"

Return ONLY a JSON object with:
- mainEntity: the main Wikipedia article title (e.g., "Albert Einstein", "Eiffel Tower", "Machine learning")
- searchTerms: array of 2-3 alternative search terms

Example output:
{"mainEntity": "Albert Einstein", "searchTerms": ["Nobel Prize in Physics", "Photoelectric effect"]}

JSON only, no markdown:`;

    const result = await model.generateContent(prompt);
    const output = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(output);
  } catch (err) {
    // Fallback: extract entities using simple heuristics
    return extractEntityFallback(claim);
  }
}

/**
 * Fallback entity extraction without AI
 */
function extractEntityFallback(claim: string): EntityExtractionResult {
  // Stopwords and pronouns to ignore
  const stopwords = new Set([
    'the', 'a', 'an', 'his', 'her', 'its', 'their', 'he', 'she', 'it', 'they',
    'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'however', 'although', 'because', 'since', 'while', 'when', 'where', 'which',
    'who', 'whom', 'whose', 'what', 'how', 'and', 'or', 'but', 'if', 'then',
    'for', 'with', 'from', 'to', 'of', 'in', 'on', 'at', 'by', 'as', 'also',
    'first', 'second', 'third', 'new', 'old', 'many', 'some', 'all', 'most'
  ]);

  // Common patterns for entity extraction
  const words = claim.split(" ");
  
  // Find capitalized sequences (likely proper nouns)
  const properNouns: string[] = [];
  let currentNoun = "";
  
  for (const word of words) {
    const cleanWord = word.replace(/[^a-zA-Z]/g, "");
    // Must be capitalized, longer than 1 char, and not a stopword
    if (cleanWord && 
        cleanWord[0] === cleanWord[0].toUpperCase() && 
        cleanWord.length > 2 && 
        !stopwords.has(cleanWord.toLowerCase())) {
      currentNoun += (currentNoun ? " " : "") + cleanWord;
    } else if (currentNoun) {
      // Only add if it's a meaningful entity (not just "The" or "His")
      if (currentNoun.length > 2 && !stopwords.has(currentNoun.toLowerCase())) {
        properNouns.push(currentNoun);
      }
      currentNoun = "";
    }
  }
  if (currentNoun && currentNoun.length > 2 && !stopwords.has(currentNoun.toLowerCase())) {
    properNouns.push(currentNoun);
  }
  
  // Sort by length (longer = more specific = better)
  properNouns.sort((a, b) => b.length - a.length);
  
  const mainEntity = properNouns[0] || words.filter(w => w.length > 3).slice(0, 3).join(" ");
  const searchTerms = properNouns.slice(1, 4);
  
  // Add topic keywords if found in claim
  const topicKeywords = [
    "Nobel Prize", "Physics", "Machine Learning", "Artificial Intelligence", 
    "World War", "Computer Science", "Deep Learning", "Neural Network"
  ];
  for (const kw of topicKeywords) {
    if (claim.toLowerCase().includes(kw.toLowerCase()) && !searchTerms.includes(kw)) {
      searchTerms.push(kw);
    }
  }
  
  return { mainEntity, searchTerms: searchTerms.slice(0, 3) };
}

/**
 * Fetch Wikipedia summary for an entity
 */
async function getWikipediaSummary(entity: string): Promise<{ extract: string; url: string; title: string } | null> {
  // Clean entity name - remove quotes and trim
  const cleanEntity = entity.replace(/['"]/g, "").trim();
  
  // First try direct page lookup
  const wikiTitle = cleanEntity.replace(/ /g, "_");
  const directUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;
  
  console.log(`[Wikipedia] Fetching: ${directUrl}`);
  
  try {
    const response = await axios.get(directUrl, { 
      timeout: 8000,
      headers: {
        'User-Agent': 'VerificationEngine/1.0 (Hackathon Project)'
      }
    });
    if (response.data && response.data.extract) {
      console.log(`[Wikipedia] Found direct match: ${response.data.title}`);
      return {
        extract: response.data.extract,
        url: response.data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${wikiTitle}`,
        title: response.data.title || entity
      };
    }
  } catch (err: any) {
    console.log(`[Wikipedia] Direct lookup failed: ${err.message}`);
    // Direct lookup failed, try search
  }
  
  // Fallback: Use Wikipedia search API
  try {
    const searchApiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanEntity)}&format=json&origin=*&srlimit=3`;
    console.log(`[Wikipedia] Searching: ${cleanEntity}`);
    
    const searchResponse = await axios.get(searchApiUrl, { 
      timeout: 8000,
      headers: {
        'User-Agent': 'VerificationEngine/1.0 (Hackathon Project)'
      }
    });
    
    if (searchResponse.data?.query?.search?.[0]) {
      const title = searchResponse.data.query.search[0].title;
      console.log(`[Wikipedia] Search found: ${title}`);
      
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`;
      const summaryResponse = await axios.get(summaryUrl, { 
        timeout: 8000,
        headers: {
          'User-Agent': 'VerificationEngine/1.0 (Hackathon Project)'
        }
      });
      
      if (summaryResponse.data?.extract) {
        return {
          extract: summaryResponse.data.extract,
          url: summaryResponse.data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
          title: summaryResponse.data.title || title
        };
      }
    }
  } catch (searchErr: any) {
    console.log(`[Wikipedia] Search failed: ${searchErr.message}`);
    // Search also failed
  }
  
  return null;
}

/**
 * Search web using SerpAPI for additional verification
 */
async function searchWeb(query: string): Promise<Array<{ title: string; snippet: string; url: string }>> {
  if (!SERP_API_KEY) return [];
  
  try {
    const response = await axios.get("https://serpapi.com/search", {
      params: {
        q: query,
        api_key: SERP_API_KEY,
        num: 5,
        engine: "google"
      },
      timeout: 8000
    });
    
    if (response.data?.organic_results) {
      return response.data.organic_results.slice(0, 5).map((r: any) => ({
        title: r.title || "",
        snippet: r.snippet || "",
        url: r.link || ""
      }));
    }
  } catch (err) {
    // Web search failed
  }
  
  return [];
}

/**
 * Use Gemini to semantically verify if source content supports the claim
 */
async function semanticVerifyWithAI(
  claim: string,
  sourceContent: string,
  sourceName: string
): Promise<{ verdict: "supports" | "contradicts" | "neutral"; confidence: number; explanation: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are a fact-checking assistant. Analyze if the source content supports, contradicts, or is neutral about the claim.

CLAIM: "${claim}"

SOURCE CONTENT (${sourceName}):
"${sourceContent.slice(0, 2000)}"

Determine:
1. Does the source SUPPORT the claim? (The facts align, even if wording differs)
2. Does the source CONTRADICT the claim? (The facts conflict)
3. Is the source NEUTRAL/UNRELATED? (Cannot verify from this source)

IMPORTANT: If the source mentions the same person/topic and the facts align with the claim, return "supports" with high confidence.

Return ONLY a JSON object:
{
  "verdict": "supports" | "contradicts" | "neutral",
  "confidence": 0-100,
  "explanation": "Brief explanation of why"
}

JSON only, no markdown:`;

    const result = await model.generateContent(prompt);
    const rawOutput = result.response.text();
    console.log(`[SemanticVerify] Raw AI response:`, rawOutput.slice(0, 200));
    
    const output = rawOutput.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(output);
    console.log(`[SemanticVerify] Parsed result:`, JSON.stringify(parsed));
    return parsed;
  } catch (err) {
    console.log(`[SemanticVerify] AI failed, using fallback:`, err);
    // Fallback to keyword-based verification
    return semanticVerifyFallback(claim, sourceContent);
  }
}

/**
 * Fallback semantic verification using keyword matching
 */
function semanticVerifyFallback(
  claim: string,
  sourceContent: string
): { verdict: "supports" | "contradicts" | "neutral"; confidence: number; explanation: string } {
  const claimLower = claim.toLowerCase();
  const sourceLower = sourceContent.toLowerCase();
  
  // Extract important words (nouns, numbers, names)
  const importantWords = claimLower
    .split(/\s+/)
    .filter(w => w.length > 3)
    .filter(w => !["that", "this", "with", "from", "have", "been", "were", "which", "their", "would", "could", "should", "received", "awarded"].includes(w));
  
  // Count matches
  let matchCount = 0;
  let totalWeight = 0;
  const matchedWords: string[] = [];
  
  for (const word of importantWords) {
    const weight = word.length > 6 ? 2 : 1; // Longer words = more important
    totalWeight += weight;
    if (sourceLower.includes(word)) {
      matchCount += weight;
      matchedWords.push(word);
    }
  }
  
  const matchRatio = totalWeight > 0 ? matchCount / totalWeight : 0;
  
  // Check for numbers matching (CRITICAL for dates, years, quantities)
  const claimNumbers: string[] = claim.match(/\d+/g) || [];
  const sourceNumbers: string[] = sourceContent.match(/\d+/g) || [];
  const numberMatches = claimNumbers.filter((n: string) => sourceNumbers.includes(n)).length;
  
  // Years are especially important - boost them
  const yearBonus = claimNumbers.filter((n: string) => n.length === 4 && sourceNumbers.includes(n)).length * 15;
  const numberBonus = claimNumbers.length > 0 ? (numberMatches / claimNumbers.length) * 25 + yearBonus : 0;
  
  const confidence = Math.min(100, Math.round(matchRatio * 60 + numberBonus + 10)); // Base 10 points if we got this far
  
  console.log(`[FallbackVerify] Match ratio: ${matchRatio.toFixed(2)}, Numbers matched: ${numberMatches}/${claimNumbers.length}, Confidence: ${confidence}`);
  console.log(`[FallbackVerify] Matched words: ${matchedWords.join(", ")}`);
  
  if (confidence >= 50) {
    return {
      verdict: "supports",
      confidence,
      explanation: `Found ${matchedWords.length} matching key terms and ${numberMatches} matching numbers in source`
    };
  } else if (confidence >= 30) {
    return {
      verdict: "neutral",
      confidence,
      explanation: "Partial keyword overlap - source is related but doesn't clearly verify the claim"
    };
  } else {
    return {
      verdict: "neutral",
      confidence,
      explanation: "Insufficient evidence in this source to verify the claim"
    };
  }
}

/**
 * Main verification function - verifies a single claim using multiple sources
 */
export const verifyClaim = async (claim: string): Promise<VerificationResult> => {
  const evidence: VerificationResult["evidence"] = [];
  let bestResult: { status: VerificationResult["status"]; confidence: number; explanation: string } | null = null;
  
  console.log(`[Verify] Starting verification for: "${claim.slice(0, 80)}..."`);
  
  // Step 1: Extract entity from claim
  const { mainEntity, searchTerms } = await extractEntityFromClaim(claim);
  console.log(`[Verify] Extracted entity: "${mainEntity}", search terms: ${JSON.stringify(searchTerms)}`);
  
  // Step 2: Try Wikipedia with main entity
  const wikiResult = await getWikipediaSummary(mainEntity);
  console.log(`[Verify] Wikipedia result for "${mainEntity}":`, wikiResult ? `Found (${wikiResult.extract.slice(0, 100)}...)` : "Not found");
  
  if (wikiResult) {
    const verification = await semanticVerifyWithAI(claim, wikiResult.extract, `Wikipedia: ${wikiResult.title}`);
    console.log(`[Verify] Semantic verification result:`, JSON.stringify(verification));
    
    evidence.push({
      source: `Wikipedia: ${wikiResult.title}`,
      verdict: verification.verdict === "supports" ? "Supports claim" : 
               verification.verdict === "contradicts" ? "Contradicts claim" : "Related content",
      url: wikiResult.url
    });
    
    if (verification.verdict === "supports") {
      bestResult = {
        status: verification.confidence >= 50 ? "verified" : "uncertain",
        confidence: verification.confidence,
        explanation: verification.explanation
      };
    } else if (verification.verdict === "contradicts") {
      bestResult = {
        status: "hallucinated",
        confidence: 100 - verification.confidence,
        explanation: verification.explanation
      };
    }
    
    // If we got a solid verification, return early
    if (bestResult && bestResult.status === "verified" && bestResult.confidence >= 70) {
      console.log(`[Verify] High confidence verification found, returning early`);
      return {
        status: bestResult.status,
        confidence: bestResult.confidence,
        explanation: bestResult.explanation,
        evidence
      };
    }
  }
  
  // Step 3: Try alternative search terms if not yet verified
  if (!bestResult || bestResult.status !== "verified") {
    for (const term of searchTerms.slice(0, 2)) {
      const altWikiResult = await getWikipediaSummary(term);
      if (altWikiResult) {
        const verification = await semanticVerifyWithAI(claim, altWikiResult.extract, `Wikipedia: ${altWikiResult.title}`);
        
        evidence.push({
          source: `Wikipedia: ${altWikiResult.title}`,
          verdict: verification.verdict === "supports" ? "Supports claim" : "Related content",
          url: altWikiResult.url
        });
        
        if (verification.verdict === "supports" && verification.confidence > (bestResult?.confidence || 0)) {
          bestResult = {
            status: verification.confidence >= 50 ? "verified" : "uncertain",
            confidence: verification.confidence,
            explanation: verification.explanation
          };
          
          if (bestResult.status === "verified" && bestResult.confidence >= 70) break;
        }
      }
    }
  }
  
  // Step 4: Web search fallback if still not verified
  if ((!bestResult || bestResult.status !== "verified") && SERP_API_KEY) {
    const webResults = await searchWeb(claim);
    
    if (webResults.length > 0) {
      // Combine snippets for analysis
      const combinedSnippets = webResults.map(r => `${r.title}: ${r.snippet}`).join("\n\n");
      const verification = await semanticVerifyWithAI(claim, combinedSnippets, "Web Search Results");
      
      // Add top web sources as evidence
      webResults.slice(0, 3).forEach(r => {
        evidence.push({
          source: r.title.slice(0, 60),
          verdict: verification.verdict === "supports" ? "Supports claim" : "Related content",
          url: r.url
        });
      });
      
      if (verification.verdict === "supports" && verification.confidence > (bestResult?.confidence || 0)) {
        bestResult = {
          status: verification.confidence >= 50 ? "verified" : "uncertain",
          confidence: verification.confidence,
          explanation: verification.explanation
        };
      }
    }
  }
  
  // Step 5: Return final result
  if (bestResult) {
    return {
      status: bestResult.status,
      confidence: bestResult.confidence,
      explanation: bestResult.explanation,
      evidence: evidence.length > 0 ? evidence : [{ source: "Verification Engine", verdict: "Analysis complete" }]
    };
  }
  
  // IMPORTANT: "Not found" does NOT mean "hallucinated"!
  // Only mark as hallucinated if we have contradicting evidence
  return {
    status: "uncertain",
    confidence: 40,
    explanation: "Could not find sufficient sources to definitively verify this claim. The claim may be too specific, recent, or domain-specific for general databases.",
    evidence: evidence.length > 0 ? evidence : [
      {
        source: "Verification Engine",
        verdict: "Requires manual review"
      }
    ]
  };
};
