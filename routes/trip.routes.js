const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Trip = require("./../models/Trip.model.js");
const User = require("./../models/User.model.js");

router.get("/trips", async (req, res) => {
  try {
    const trips = await Trip.find();
    res.json(trips);
  } catch (error) {
    res.status(500).send({ error: "An error occurred while fetching trips" });
  }
});

router.post("/trips/new", async (req, res) => {
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

router.get("/trips/:tripId", async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.tripId });
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

router.delete("/trips/:tripId", async (req, res) => {
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

module.exports = router;
