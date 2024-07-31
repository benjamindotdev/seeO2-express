require("dotenv").config();
var cors = require("cors");
const express = require("express");
const axios = require("axios");
const emissions = require("./emissions.json");

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require("./models/User");
const Trip = require("./models/Trip");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const app = express();
app.use(express.json());

app.use(cors());

app.get("/", (req, res) => {
  res.json(db);
});

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

app.post("/result", (req, res) => {
  const ironhack = {
    lat: "52.53308",
    lng: "13.45321",
  };
  const { lat, lng, destination } = req.body;
  const types = [
    {
      profile: "car",
      url: `https://graphhopper.com/api/1/route?point=${ironhack.lat},${ironhack.lng}&point=${lat},${lng}&locale=en&key=${process.env.GRAPHHOPPER_API_KEY}&profile=car`,
    },
    {
      profile: "bike",
      url: `https://graphhopper.com/api/1/route?point=${ironhack.lat},${ironhack.lng}&point=${lat},${lng}&locale=en&key=${process.env.GRAPHHOPPER_API_KEY}&profile=bike`,
    },
    {
      profile: "foot",
      url: `https://graphhopper.com/api/1/route?point=${ironhack.lat},${ironhack.lng}&point=${lat},${lng}&locale=en&key=${process.env.GRAPHHOPPER_API_KEY}&profile=foot`,
    },
  ];

  const requests = types.map((type) => {
    return {
      request: axios.get(type.url),
      profile: type.profile,
    };
  });

  axios
    .all(requests.map((req) => req.request))
    .then((responses) => {
      const newResults = responses.map((res, index) => ({
        destination: destination,
        distance: (res.data.paths[0].distance / 1000).toFixed(2),
        time: res.data.paths[0].time / 60000,
        profile: requests[index].profile,
      }));
      return newResults;
    })
    .then((response) => {
      const profiles = [...response];
      const newTrip = new Trip({
        origin: {
          name: "Ironhack, Berlin",
          lat: ironhack.lat,
          lng: ironhack.lng,
        },
        destination: {
          name: destination,
          lat,
          lng,
        },
        profiles: profiles.map((result) => ({
          profile: result.profile,
          distance: result.distance,
          time: result.time,
          emissions: result.distance * emissions[0][result.profile],
        })),
      });
      newTrip._id = new mongoose.Types.ObjectId();
      newTrip.save();
      res.status(201).send(newTrip);
    })
    .catch((error) => {
      console.log(error.response);
      res
        .status(500)
        .send({ error: "An error occurred while processing the request" });
    });
});

app.post("/dashboard", (req, res) => {
  const { destination } = req.body;
  axios
    .get(
      `https://graphhopper.com/api/1/geocode?q=${destination}&locale=en&key=${process.env.GRAPHHOPPER_API_KEY}`
    )
    .then((response) => {
      res.send(response.data.hits);
    })
    .catch((error) => {
      console.log(error.response);
    });
});

app.get("/trips", async (req, res) => {
  try {
    const trips = await Trip.find();
    res.json(trips);
  } catch (error) {
    res.status(500).send({ error: "An error occurred while fetching trips" });
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
