# PS-03 Verification Backend

Node.js + Express + TypeScript + **Gemini AI** + **Wikipedia** + MongoDB Atlas service for claim verification.

## Stack
- **Gemini 1.5 Flash**: Claim extraction from AI text
- **Wikipedia REST API**: Fact verification
- **MongoDB Atlas**: Result persistence
- **Express + TypeScript**: Clean microservice architecture

## Quick start

1. Install deps:
   ```bash
   npm install
   ```
2. Create `.env` from example:
   ```bash
   cp .env.example .env
   ```
   Set `MONGO_URI`, `GEMINI_API_KEY`, and optionally `SERP_API_KEY`.

3. Run dev:
   ```bash
   npm run dev
   ```

4. Test APIs:
   ```bash
   # Step 1: Analyze text
   curl -X POST http://localhost:4000/api/verification/analyze \
     -H "Content-Type: application/json" \
     -d '{"text":"Albert Einstein developed the theory of relativity and won the Nobel Prize in 1922."}'

   # Returns: { "analysisId": "abc123", "trustScore": 68, "label": "Review Recommended", "summary": "..." }

   # Step 2: Get claims
   curl http://localhost:4000/api/verification/abc123/claims

   # Step 3: Inspect evidence for a claim
   curl http://localhost:4000/api/verification/claim/c1/evidence

   # Step 4: Get verified rewrite
   curl http://localhost:4000/api/verification/abc123/verified-text
   ```

## Project structure
- `src/app.ts` – Express app setup
- `src/server.ts` – Bootstrap + MongoDB connection
- `src/route/verification.route.ts` – 4 REST endpoints
- `src/controller/verification.controller.ts` – Request handlers
- `src/service/`
  - `claim.service.ts` – Gemini AI claim extraction
  - `citation.service.ts` – Wikipedia fact verification
  - `scoring.service.ts` – Trust score calculation
  - `verification.service.ts` – Orchestrator (analyze → verify → store)
- `src/model/VerificationResult.ts` – MongoDB schema

## API Flow
```
POST /api/verification/analyze
 → Gemini extracts claims
 → Wikipedia verifies each claim
 → Trust score calculated
 → Result saved to MongoDB
 → Returns analysisId + score

GET /api/verification/:id/claims
 → Returns claim list with status

GET /api/verification/claim/:claimId/evidence
 → Returns evidence + citation check

GET /api/verification/:id/verified-text
 → Returns hallucination-free rewrite
```

## Notes
- Gemini API key required (get from ai.google.dev)
- Wikipedia API is free (no key needed)
- SerpAPI optional (for enhanced web search)
- CommonJS for simpler Gemini integration
