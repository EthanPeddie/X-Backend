import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { log } from "console";

const router = Router();

const prisma = new PrismaClient();
// CRUD

// Create
router.post("/", async (req, res) => {
  const { name, username, email, image, bio } = req.body;
  try {
    const result = await prisma.user.create({
      data: {
        email: "Kaung@gmail.com",
        name: "Kaung",
        username: "kaung",
        image: "empty",
        bio: "Unknown Text",
      },
    });
    res.json(result);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get
router.get("/", async (req, res) => {
  const allUser = await prisma.user.findMany();
  res.json(allUser);
});
// Get One
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    res.json(user);
  } catch (error) {}
});

// Update
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, username, email } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        name: "sarbaeGyi",
        username: "sarbaeGyi",
        email: "sarbaeGyi@Gmail.com",
      },
    });
    res.json(user);
  } catch (error) {
    log(error);
    res.status(501).json({ error: "Error in there" });
  }
});

// Delete

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.user.delete({ where: { id: Number(id) } });
});

export default router;
