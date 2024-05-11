import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const router = Router();
const prisma = new PrismaClient();

// CRUD

// Create
router.post("/", async (req, res) => {
  const { content, image, userId } = req.body;
  try {
    const result = await prisma.tweet.create({
      data: {
        content,
        image,
        userId,
      },
    });
    res.json(result);
  } catch (error) {
    console.log(error);
    res.send(501).json({ error: "Bad Request Error" });
  }
});

// Get
router.get("/", async (req, res) => {
  const result = await prisma.tweet.findMany();
  if (!result) {
    return res.status(404).json({ error: "Tweet Not Found!" });
  }
  res.json(result);
  res.status(200);
});
// Get One
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await prisma.tweet.findUnique({ where: { id: Number(id) } });
    res.json(result);
    res.status(200);
  } catch (error) {
    res.send(501).json(error);
  }
});

// Update
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { content, image, userId } = req.body;
  try {
    const result = await prisma.tweet.update({
      where: { id: Number(id) },
      data: {
        content,
        image,
        userId,
      },
    });
    res.json(result);
    res.status(200);
  } catch (error) {
    res.send(501).json(error);
  }
});

// Delete

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await prisma.tweet.delete({ where: { id: Number(id) } });
    res.json(result);
    res.status(200);
  } catch (error) {
    res.send(501).json(error);
  }
});

export default router;
