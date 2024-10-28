const express = require("express");
const router = express.Router();
const caseController = require("../controllers/caseController");
const auth = require("../middleware/auth");

router.get("/new", auth, caseController.showCreateCaseForm);

router.get("/", auth, caseController.getCases);
router.get("/:id", auth, caseController.getCaseById);
router.get("/:id/edit", auth, caseController.showEditCaseForm);
router.put("/:id", auth, caseController.updateCase);
router.delete("/:id", auth, caseController.deleteCase);

router.post("/compare", auth, caseController.compareCases);

module.exports = router;
