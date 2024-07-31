require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const emissions = require("./emissions.json");

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require("./models/User.model");
const Trip = require("./models/Trip.model");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const app = express();
app.use(express.json());
app.use(cors());

app.get("/trips", async (req, res) => {
  try {
    const trips = await Trip.find();
    res.json(trips);
  } catch (error) {
    res.status(500).send({ error: "An error occurred while fetching trips" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).send({ error: "An error occurred while fetching users" });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ error: "User not found" });
    }
  } catch (error) {
    res
      .status(500)
      .send({ error: "An error occurred while fetching the user" });
  }
});

app.post("/result", async (req, res) => {
  const { lat, lng, destination } = req.body;
  const origin = {
    name: "Ironhack, Berlin",
    lat: "52.53308",
    lng: "13.45321",
  };

  const types = ["car", "bike", "foot"];

  try {
    const responses = await Promise.all(
      types.map((type) =>
        axios.get(
          `https://graphhopper.com/api/1/route?point=${origin.lat},${origin.lng}&point=${lat},${lng}&locale=en&key=${process.env.GRAPHHOPPER_API_KEY}&profile=${type}`
        )
      )
    );
    const profiles = responses.map((res, index) => ({
      distance: (res.data.paths[0].distance / 1000).toFixed(2),
      time: res.data.paths[0].time / 60000,
      profile: types[index],
      emissions:
        (res.data.paths[0].distance / 1000) * emissions[0][types[index]],
    }));

    const newTrip = new Trip({
      _id: new mongoose.Types.ObjectId(),
      origin,
      destination: {
        name: destination,
        lat,
        lng,
      },
      profiles,
    });

    await newTrip.save();
    res.status(201).send(newTrip);
  } catch (error) {
    console.log(error.response);
    res
      .status(500)
      .send({ error: "An error occurred while processing the request" });
  }
});

app.post("/dashboard", async (req, res) => {
  const { destination } = req.body;
  try {
    const response = await axios.get(
      `https://graphhopper.com/api/1/geocode?q=${destination}&locale=en&key=${process.env.GRAPHHOPPER_API_KEY}`
    );
    res.send(response.data.hits);
  } catch (error) {
    console.log(error.response);
    res
      .status(500)
      .send({ error: "An error occurred while fetching geocode data" });
  }
});

app.get("/trips/:tripId", async (req, res) => {
  try {
    const trip = await Trip.findOne({ id: req.params.tripId });
    if (trip) {
      res.send(trip);
    } else {
      res.status(404).send({ error: "Trip not found" });
    }
  } catch (error) {
    res
      .status(500)
      .send({ error: "An error occurred while fetching the trip" });
  }
});

app.delete("/trips/:tripId", async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ id: req.params.tripId });
    if (trip) {
      res.send({ message: "Trip deleted" });
    } else {
      res.status(404).send({ error: "Trip not found" });
    }
  } catch (error) {
    res
      .status(500)
      .send({ error: "An error occurred while deleting the trip" });
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
