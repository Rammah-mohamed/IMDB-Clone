const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized. Please log in.');
  }
  next();
};

module.exports = { requireAuth };
