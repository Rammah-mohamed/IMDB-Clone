const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    next(); // User is authenticated
  } else {
    res.status(401).send({ error: "Unauthorized" });
  }
};

module.exports = { requireAuth };
