const express = require("express");
const cors = require("cors");
const app = express();
const port = 8000;

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hell",
  });
});
