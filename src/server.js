const app = require("./app");
const uuid = require("uuid/v4");

const { PORT, NODE_ENV } = require("./config");

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
