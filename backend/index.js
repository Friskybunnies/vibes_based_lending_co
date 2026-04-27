const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/evaluations", (req, res) => {
  res.json({ message: "Hello from Express" });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});