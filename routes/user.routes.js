const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Trip = require("./../models/Trip.model.js");
const User = require("./../models/User.model.js");

router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).send({ error: "An error occurred while fetching users" });
  }
});

router.get("/users/:id", async (req, res) => {
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

router.post("/dashboard", async (req, res) => {
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

router.get("/dashboard", async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user._id });
    res.send(trips);
  } catch (error) {
    res
      .status(500)
      .send({ error: "An error occurred while fetching the dashboard data" });
  }
});

module.exports = router;
