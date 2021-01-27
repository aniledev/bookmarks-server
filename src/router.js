// refactor endpoints into router
require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const { NODE_ENV, PORT } = require("./config");
const app = express();
const store = require("./dummy-store");
const { stream } = require("winston");
const uuid = require("uuid").v4;
const { isUri } = require("valid-url");
const validateToken = require("./validate-token");
const logger = require("./winston-logger");
const { bookmarks } = require("./dummy-store");
const router = express.Router();

router
  .route("/bookmarks")
  .get((req, res) => {
    res.json(store.bookmarks);
  })
  .post((req, res) => {
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
    return res
      .status(200)
      .json(bookmark)
      .send("Bookmark created successfully.");
  });

router
  .route("/bookmarks/:bookmark_id")
  .get((req, res) => {
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
  })
  .delete((req, res) => {
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

module.exports = router;
