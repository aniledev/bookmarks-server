// IMPORT REQUIRED LIBRARIES AND SECURITY PACKAGES
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
const router = require("./router");

// CONFIGURE LOGGING
const morganOption = NODE_ENV === "production" ? "tiny" : "dev";

//STANDARD MIDDLEWARE
app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json());

// API KEY HANDLING MIDDLE ON THE SERVER
app.use(validateToken);

//ROUTES
app.use(router);


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
