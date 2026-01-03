import { Router } from "express";
import {
  analyzeText,
  getClaims,
  getClaimEvidence,
  getVerifiedText
} from "../controller/verification.controller";

const router = Router();

router.post("/analyze", analyzeText);
router.get("/:id/claims", getClaims);
router.get("/claim/:claimId/evidence", getClaimEvidence);
router.get("/:id/verified-text", getVerifiedText);

export default router;
