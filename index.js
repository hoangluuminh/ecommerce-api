const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const HttpError = require("./app/models/classes/http-error");
const LoggingUtil = require("./app/utils/logging.utils");
const { ERRORS } = require("./app/utils/const.utils");
const routes = require("./app/routes");

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", `${process.env.CLIENT_HOST}:${process.env.CLIENT_PORT}`],
    credentials: true
  })
);

// API Route Handler
app.use("/api-shop", routes);
app.use("/api-manage", routes);

// Undefined route Handler
app.use((req, res, next) => {
  const error = new HttpError(...ERRORS.MISC.ROUTE);
  next(error);
});

// Error Handler
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  return res
    .status(error.code || 500)
    .json({ name: error.name || "Error", message: error.message || "An unknown error occured" });
});

// Database Sync
const db = require("./app/models");

db.sequelize
  .sync()
  .then(() => {
    console.log("Connected to MySQL Server successfully!!!");
    app.listen(process.env.PORT || 5000);
  })
  .catch(error => {
    LoggingUtil.getDatabaseInteractMsg("index", error);
  });
