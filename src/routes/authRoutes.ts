import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

import { sendEmailToken } from "../services/emailService";

const prisma = new PrismaClient();
const jwt_secret = "Key";

interface TokenGenerator {
  generateToken(length: number): string;
}

interface ExpirationTimeGenerator {
  generateExpirationTime(minutes: number): Date;
  generateExpirationTimeWithHours(hours: number): Date;
}

interface AuthTokenGenerator {
  generateAuthToken(tokenId: number): string;
}

class AlphanumericTokenGenerator implements TokenGenerator {
  generateToken(length: number): string {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let token = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      token += charset[randomIndex];
    }
    return token;
  }
}

class ExpirationTimeCalculator implements ExpirationTimeGenerator {
  generateExpirationTime(minutes: number): Date {
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + minutes);
    return expiration;
  }
  generateExpirationTimeWithHours(hours: number): Date {
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + hours);
    return expiration;
  }
}

class AuthenticationToken implements AuthTokenGenerator {
  private jwt_secret: string;

  constructor(jwt_secret: string) {
    this.jwt_secret = jwt_secret;
  }

  generateAuthToken(tokenId: number): string {
    const payload = { tokenId };
    return jwt.sign(payload, this.jwt_secret, {
      algorithm: "HS256",
      noTimestamp: true,
    });
  }
}

class TokenService {
  private tokenGenerator: TokenGenerator;
  private expirationGenerator: ExpirationTimeGenerator;

  constructor(
    tokenGenerator: TokenGenerator,
    expirationGenerator: ExpirationTimeGenerator
  ) {
    this.tokenGenerator = tokenGenerator;
    this.expirationGenerator = expirationGenerator;
  }

  generateToken(length: number): string {
    return this.tokenGenerator.generateToken(length);
  }

  generateExpirationTime(minutes: number): Date {
    return this.expirationGenerator.generateExpirationTime(minutes);
  }

  generateExpirationTimeWithHours(hours: number): Date {
    return this.expirationGenerator.generateExpirationTimeWithHours(hours);
  }
}

const router = Router();
const tokenService = new TokenService(
  new AlphanumericTokenGenerator(),
  new ExpirationTimeCalculator()
);
const authTokenService = new AuthenticationToken(jwt_secret);

// For New User
router.post("/login", async (req: Request, res: Response) => {
  const { email } = req.body;

  const emailToken = tokenService.generateToken(8);
  const expiration: Date = tokenService.generateExpirationTime(5); // Token expires in 5 minutes

  try {
    const createdToken = await prisma.token.create({
      data: {
        type: "EMAIL",
        emailToken,
        expiration,
        valid: true,
        user: {
          connectOrCreate: {
            where: { email },
            create: { email },
          },
        },
      },
    });
    console.log(createdToken);
    await sendEmailToken(email, emailToken);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error creating token:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// For Authenticate User
router.post("/authenticate", async (req: Request, res: Response) => {
  const { email, emailToken } = req.body;

  const expiration = tokenService.generateExpirationTimeWithHours(12); // Token expires in 12 hours

  const dbEmailToken = await prisma.token.findUnique({
    where: { emailToken },
    include: { user: true },
  });

  if (!dbEmailToken || !dbEmailToken.valid) {
    return res.sendStatus(401);
  }

  if (dbEmailToken.expiration < new Date()) {
    return res.status(401).json({ error: "Token expired" });
  }

  const apiToken = await prisma.token.create({
    data: {
      type: "API",
      expiration,
      user: {
        connect: {
          email,
        },
      },
    },
  });
  console.log(apiToken);

  await prisma.token.update({
    where: { id: dbEmailToken.id },
    data: {
      valid: false,
    },
  });

  const authToken = authTokenService.generateAuthToken(apiToken.id);

  console.log("AuthToken", authToken);

  res.json({ authToken });
});

export default router;
