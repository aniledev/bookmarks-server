// this is where the validate token function should go
const { API_TOKEN } = require("./config");
const logger = require("./winston-logger");

function validateToken(req, res, next) {
  const apiToken = API_TOKEN;
  const authToken = req.get("Authorization");
  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    logger.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({ error: "Unauthorized request" });
  }
  next();
}

module.exports = validateToken;
