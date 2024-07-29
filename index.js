require("dotenv").config();
const express = require("express");
const db = require("./db.json");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/trips", (req, res) => {
  res.send(req.body);
});

app.get("/users", (req, res) => {
  res.send(req.body);
});
app.get("/users/:id", (req, res) => {
  axios
    .get(`/users/${userId}`)
    .then((response) => {
      setUsers(response.data);
    })
    .catch((error) => {
      console.log(error.response);
    });
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

const port = process.env.PORT;

app.listen(port, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server is running at port ${port}`);
});
