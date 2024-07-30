require("dotenv").config();
var cors = require("cors");
const express = require("express");
const db = require("./db.json");
const axios = require("axios");
const emissions = require("./emissions.json");

const app = express();
app.use(express.json());

app.use(cors());

app.get("/", (req, res) => {
  res.json(db);
});

app.get("/trips", (req, res) => {
  res.json(db.trips);
});

app.get("/users", (req, res) => {
  res.json(db.users);
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

app.post("/result", async (req, res) => {
  const ironhack = {
    lat: 52.53308,
    lng: 13.45321,
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

  await axios
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
      console.log(response);
      const profiles = [...response];
      const newTrip = {
        id: db.trips.length + 1,
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
      };
      console.log(newTrip);
      db.trips.push(newTrip);
      res.send(newTrip);
    })
    .catch((error) => {
      console.log(error.response);
      res
        .status(500)
        .send({ error: "An error occurred while processing the request" });
    });
});

app.post("/trips", (req, res) => {
  db.trips.push(req.body);
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
