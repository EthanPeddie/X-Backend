import express from "express";

import userRoutes from "./routes/userRoutes";
import tweetRoutes from "./routes/tweetRoutes";
import authRoutes from "./routes/authRoutes";
import { AuthenticateToken } from "./middlewares/authMiddleware";

const app = express();
const port = 3001;

app.use(express.json());
app.use("/users", AuthenticateToken, userRoutes);
app.use("/tweet", AuthenticateToken, tweetRoutes);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
