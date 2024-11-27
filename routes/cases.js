const express = require("express");
const router = express.Router();
const caseController = require("../controllers/caseController");
const auth = require("../middleware/auth");

router.get("/new", auth, caseController.showCreateCaseForm);
router.post("/", auth, caseController.createCase);
router.get("/", auth, caseController.getCases);
router.get("/:id", auth, caseController.getCaseById);
router.get("/:id/edit", auth, caseController.showEditCaseForm);
router.put("/:id", auth, caseController.updateCase);
router.delete("/:id", auth, caseController.deleteCase);

router.post("/compare", auth, caseController.compareCases);

router.get("/:id/options", auth, caseController.showOptions);
router.post("/:id/analyze", auth, caseController.analyzeCase);
router.get("/:id/analyze", auth, caseController.analyzeCase);
router.post("/:id/store", auth, caseController.storeCase);

router.get("/:id/edit-treatment", caseController.showEditTreatmentForm);

module.exports = router;
