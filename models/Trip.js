const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  id: Number,
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
