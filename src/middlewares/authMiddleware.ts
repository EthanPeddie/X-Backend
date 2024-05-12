import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient, User } from "@prisma/client";

const jwt_secret = "Key";
const prisma = new PrismaClient();

type AuthRequest = Request & { user?: User };

export async function AuthenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];

  const jwtToken = authHeader?.split(" ")[1];

  if (!jwtToken) {
    return res.sendStatus(401);
  }

  console.log("JWT: ", jwtToken);

  try {
    const payload = jwt.verify(jwtToken, jwt_secret) as { tokenId: number };

    if (!payload.tokenId) {
      return res.sendStatus(401);
    }
    const dbToken = await prisma.token.findUnique({
      where: { id: payload.tokenId },
      include: { user: true },
    });

    // if (!dbToken?.valid || dbToken.expiration < new Date()) {
    //   return res.status(401).json({ error: "API Token Expired" });
    // }

    if (!dbToken?.valid) {
      return res.status(401).json({ error: "API Not Valid" });
    }

    if (dbToken.expiration < new Date()) {
      return res.status(401).json({ error: "API Token Expired" });
    }
    req.user = dbToken.user;
  } catch (error) {
    console.log(error);
    return res.sendStatus(401);
  }

  next();
}
