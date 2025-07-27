const app = require("./index"); // imports the express app

module.exports = (req, res) => {
  app(req, res); // forward the request to Express
};
