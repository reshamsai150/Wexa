const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.message.includes('Database driver not initialized')) {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Unable to connect to CareerGraph database. Please try again later.'
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong.'
  });
};

module.exports = errorHandler;
