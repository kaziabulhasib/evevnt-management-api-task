require("dotenv").config();
const express = require("express");

const cors = require("cors");
const eventRoutes = require("./routes/event.routes");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// routes

app.use("/event", eventRoutes);

app.get("/", (req, res) => {
  res.send("event api running ........");
});

app.listen(PORT, () => {
  console.log("Server is running on port : ", PORT);
});
