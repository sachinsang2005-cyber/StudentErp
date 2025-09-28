const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Default error
  let error = { ...err };
  error.message = err.message;

  // Supabase errors
  if (err.code) {
    switch (err.code) {
      case '23505':
        error.message = 'Duplicate entry found';
        break;
      case '23503':
        error.message = 'Referenced record does not exist';
        break;
      default:
        error.message = 'Database error occurred';
    }
  }

  res.status(error.statusCode || 500);
  
  if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
    return res.json({
      success: false,
      error: error.message
    });
  }

  res.render('error', {
    title: 'Error',
    message: error.message,
    teacher: req.session.teacher || null
  });
};

module.exports = errorHandler;