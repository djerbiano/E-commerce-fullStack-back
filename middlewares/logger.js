const logger = (req, res, next) => {
  console.log(
    `Date : ${new Date(
      new Date().getTime() + 120 * 60000
    ).toISOString()} / method: ${req.method} / URL: ${req.protocol}://${req.get(
      "host"
    )}${req.originalUrl}`
  );
  next();
};
module.exports = logger;
