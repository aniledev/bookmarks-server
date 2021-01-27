// IMPORT REQUIRED LIBRARIES AND SECURITY PACKAGES
require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const winston = require("winston");
const { NODE_ENV, PORT } = require("./config");
const app = express();
const store = require("./dummy-store");
const { stream } = require("winston");
const uuid = require("uuid").v4;
const { isUri } = require("valid-url");
const validateToken = require("./validate-token");

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
app.use(validateToken);

//ROUTES
// endpoint GET /bookmarks that returns a list of bookmarks
app.get("/bookmarks", (req, res) => {
  res.json(store.bookmarks);
});

// endpoint GET /bookmarks/:id that returns a single bookmark with the given ID, return 404 Not Found if the ID is not found
app.get("/bookmarks/:bookmark_id", (req, res) => {
  // use object destructuring to get the bookmark id
  const { bookmark_id } = req.params;

  // use find method to find bookmark with a specific id
  const bookmark = store.bookmarks.find(
    (bookmark) => bookmark.id == bookmark_id
  );

  // validate if there isn't a bookmark that matches that id
  if (!bookmark) {
    logger.error(`Bookmark with ${bookmark_id} not found.`);
    return res.status(400).send("Bookmark not found. Please try again.");
  }
  res.json(bookmark);
});

// Write a route handler for POST /bookmarks that accepts a JSON object representing a bookmark and adds it to the list of bookmarks after validation.
app.post("/bookmarks", (req, res) => {
  // use object destructuring to access the req body
  const { title, url, description, rating } = req.body;

  //use a for of loop instead of forEach because we're dealing with an object
  for (const query of ["title", "url", "description"]) {
    if (!req.body[query]) {
      logger.error(`${query} is required.`);
      return res.status(400).send(`${field} is required. Please try again.`);
    }
  }

  // validate if the number isn't a number or if its outside 1 to 5,
  if (Number.isNaN(rating) || rating < 0 || rating > 5) {
    logger.error(`Invalid rating '${rating}' entered.`);
    return res.status(400).send("Rating must be a number between 0 and 5.");
  }

  // THIS IS THE PART I HAD TO LOOK AT THE SOLUTION FOR AS I DIDN'T KNOW IF THERE WERE REGEX TO VALIDATE AN URL LIKE AN EMAIL
  if (!isUri(url)) {
    logger.error(`Invalid url '${url}' entered.`);
    return res.status(400).send(`URL must be a valid URL.`);
  }

  // create a bookmark object to push to the store based on the req body after validation
  const bookmark = { id: uuid(), title, url, description, rating };

  store.bookmarks.push(bookmark);

  logger.info("Bookmark created successfully!");
  return res.status(200).json(bookmark).send("Bookmark created successfully.");
});
// Write a route handler for the endpoint DELETE /bookmarks/:id that deletes the bookmark with the given ID.
app.delete("/bookmarks/:bookmark_id", (req, res) => {
  // destructure the req object to specific the bookmark id of the one we want to delete
  const { bookmark_id } = req.params;
  // use the findIndex method to find the index of the bookmark in the array that we want to delete
  const index = store.bookmarks.findIndex(
    (bookmark) => bookmark.id === bookmark_id
  );

  // what if they want to delete a bookmark that doesn't exist
  if (index === -1) {
    logger.error(`Bookmark with id ${bookmark_id} not found.`);
    return res.status(400).send("Bookmark not found. Please try again.");
  }

  // use the splice method to remove 1 from the array at the index number; use end() because no response is necessary
  store.bookmarks.splice(index, 1);
  logger.info(`Bookmark with id ${bookmark_id} has been deleted.`);
  res.status(204).end();
});

// CATCH ANY THROWN ERRORS AND THEN DEFINE THE ERROR AND KEEP THE APPLICATION RUNNING;
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
