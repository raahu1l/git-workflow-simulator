const getHealth = (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is running",
  });
};

module.exports = {
  getHealth,
};