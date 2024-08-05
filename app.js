require("dotenv/config");
require("./db");
const express = require("express");

const axios = require("axios");
const emissions = require("./emissions.json");

const { isAuthenticated } = require("./middleware/jwt.middleware");

const User = require("./models/User.model");
const Trip = require("./models/Trip.model");

const app = express();
require("./config")(app);

const allRoutes = require("./routes");
app.use("/api", allRoutes);

const userRouter = require("./routes/user.routes");
app.use("/api", isAuthenticated, userRouter);

const tripRouter = require("./routes/trip.routes");
app.use("/api", isAuthenticated, tripRouter);

const authRouter = require("./routes/auth.routes");
app.use("/auth", authRouter);

module.exports = app;
