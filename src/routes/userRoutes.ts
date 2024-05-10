import { Router } from "express";

const router = Router();

// CRUD

// Create
router.post("/", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

// Get
router.get("/", (req, res) => {
  res.status(501).json({ error: "Not implementd" });
});
// Get One
router.get("/:id", (req, res) => {
  const { id } = req.params;
  res.status(501).json({ error: `Not implementd ${id}` });
});

// Update
router.put("/:id", (req, res) => {
  const { id } = req.params;
  res.status(501).json({ error: `Not implementd ${id}` });
});

// Delete

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  res.status(501).json({ error: `Not implementd ${id}` });
});

export default router;
