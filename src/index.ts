import express from "express";
import userRoutes from "./routes/userRoutes";
import tweetRoutes from "./routes/tweetRoutes";

const app = express();
const port = 3000;

app.use(express.json());
app.use("/users", userRoutes);
app.use("/tweet", tweetRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
