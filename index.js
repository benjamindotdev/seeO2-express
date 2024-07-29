require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

app.get("/trips", (req, res) => {
  res.send(req.body);
});

app.get("/users", (req, res) => {
  res.send(req.body);
});

app.post("/trips", (req, res) => {
  res.send(req.body);
});

app.get("/trips/:tripId", (req, res) => {
  res.send(req.params);
});

app.delete("/trips/:tripId", (req, res) => {
  res.send(req.params);
});

const port = process.env.PORT || 5005;

app.listen(port, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server is running at port ${port}`);
});
