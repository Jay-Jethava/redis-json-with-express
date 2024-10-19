const express = require("express"); // Create an express application
const cors = require("cors");
require("./utils/db");
const router = require("./routes/index");
const createHttpError = require("http-errors");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use(router);

app.use(function (req, res, next) {
  next(createHttpError(404, "URL Not Found"));
});

// error handler
app.use(function (err, req, res, next) {
  console.log({ err });
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || "Unknown Error",
    stack: err.stack,
  });
});

module.exports = app;
