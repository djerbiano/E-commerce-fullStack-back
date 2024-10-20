const errMiddleware = (err, req, res, next) => {
  console.error(err);

  const errorResponse = {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
  };

  return res.status(err.status || 404).json(errorResponse);
};

module.exports = errMiddleware;
