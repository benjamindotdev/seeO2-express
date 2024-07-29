require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/trips", (req, res) => {
  res.json({});
});

app.post("/trips", (req, res) => {
  res.json({});
});

app.get("/trips/:tripId", (req, res) => {
  res.json({});
});

app.delete("/trips/:tripId", (req, res) => {
  res.json({});
});

const port = process.env.PORT || 5005;

app.listen(port, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server is running at port ${port}`);
});
