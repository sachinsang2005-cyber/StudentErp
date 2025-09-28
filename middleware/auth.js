const requireAuth = (req, res, next) => {
  if (req.session && req.session.teacher) {
    return next();
  } else {
    req.flash('error', 'Please log in to access this page');
    return res.redirect('/login');
  }
};

const requireGuest = (req, res, next) => {
  if (req.session && req.session.teacher) {
    return res.redirect('/dashboard');
  } else {
    return next();
  }
};

module.exports = {
  requireAuth,
  requireGuest
};