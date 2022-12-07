const notFound = (req, res) =>
  res.status(404).send("Sorry! Route does not exist");

module.exports = notFound;
