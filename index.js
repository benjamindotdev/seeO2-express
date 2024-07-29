require("dotenv").config();
const express = require("express");
const db = require("./db.json");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send(db);
});

app.get("/trips", (req, res) => {
  res.send(db.trips);
});

app.get("/users", (req, res) => {
  res.send(db.users);
});
app.get("/users/:id", (req, res) => {
  const userId = req.params.id;
  const user = db.users.find((u) => u.id === userId);
  if (user) {
    res.send(user);
  } else {
    res.status(404).send({ error: "User not found" });
  }
});

app.post("/trips", (req, res) => {
  res.send(req.body);
});

app.get("/trips/:tripId", (req, res) => {
  const tripId = req.params.tripId;
  const trip = db.trips.find((t) => t.id === tripId);
  if (trip) {
    res.send(trip);
  } else {
    res.status(404).send({ error: "Trip not found" });
  }
});

app.delete("/trips/:tripId", (req, res) => {
  const tripId = req.params.tripId;
  const tripIndex = db.trips.findIndex((t) => t.id === tripId);
  if (tripIndex !== -1) {
    db.trips.splice(tripIndex, 1);
    res.send({ message: "Trip deleted" });
  } else {
    res.status(404).send({ error: "Trip not found" });
  }
});

const port = process.env.PORT;

app.listen(port, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server is running at port ${port}`);
});
