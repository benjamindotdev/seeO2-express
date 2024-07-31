const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  origin: {
    name: String,
    lat: String,
    lng: String,
  },
  destination: {
    name: String,
    lat: String,
    lng: String,
  },
  profiles: [
    {
      profile: String,
      distance: Number,
      time: Number,
      emissions: Number,
    },
  ],
});

module.exports = mongoose.model("Trip", tripSchema);
