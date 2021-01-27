// IMPORT REQUIRED LIBRARIES AND SECURITY PACKAGES
require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const winston = require("winston");
const { NODE_ENV, PORT } = require("./config");
const app = express();

// CONFIGURE LOGGING
const morganOption = NODE_ENV === "production" ? "tiny" : "dev";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: "info.log" })],
});

if (NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

//STANDARD MIDDLEWARE
app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json());

// API KEY HANDLING MIDDLE ON THE SERVER
app.use(function validationBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get("Authorization");
  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    return res.status(401).json({ error: "Unauthorized request/" });
  }
  next();
});

//ROUTES
// Write a route handler for the endpoint GET /bookmarks that returns a list of bookmarks
app.get("/bookmarks", (req, res) => {
  res.send("Hello, world!");
});

// Write a route handler for the endpoint GET /bookmarks/:id that returns a single bookmark with the given ID, return 404 Not Found if the ID is not valid
app.get("/bookmarks/:bookmark_id", (req, res) => {
  res.send("Hello, world!");
});
// Write a route handler for POST /bookmarks that accepts a JSON object representing a bookmark and adds it to the list of bookmarks after validation.
app.post("/bookmarks", (req, res) => {
  res.send("Hello, world!");
});
// Write a route handler for the endpoint DELETE /bookmarks/:id that deletes the bookmark with the given ID.
app.delete("/bookmarks/:bookmark_id", (req, res) => {
  res.send("Hello, world!");
});


// CATCH ANY THROWN ERRORS AND THEN DEFINE THE ERROR AND KEEP THE APPLICATION RUNNING;
//STILL MIDDLEWARE
app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

//PIPELINE ENDS
module.exports = app;
