const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProfileSchema = new Schema(
  {
    profile: String,
    distance: Number,
    time: Number,
    emissions: Number,
  },
  { _id: false }
);

const DestinationSchema = new Schema({
  name: String,
  lat: String,
  lng: String,
});

const TripSchema = new Schema({
  origin: {
    name: String,
    lat: String,
    lng: String,
  },
  destination: DestinationSchema,
  profiles: [ProfileSchema],
});

module.exports = mongoose.model("Trip", TripSchema);
