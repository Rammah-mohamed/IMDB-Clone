const requireAuth = (req, res, next) => {
  console.log('session:', req.session);
  if (req.session && req.session.userId) {
    next(); // User is authenticated
  } else {
    res.status(401).send({ error: 'Unauthorized' });
  }
};

module.exports = { requireAuth };
