// this is where the validate token function should go
const { API_TOKEN } = require("./config");

function validateToken(req, res, next) {
  const apiToken = API_TOKEN;
  const authToken = req.get("Authorization");
  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    return res.status(401).json({ error: "Unauthorized request" });
  }
  next();
}

module.exports = validateToken;
