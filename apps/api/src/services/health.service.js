const getHealthStatus = () => {
  return {
    status: "OK",
    message: "Backend is running",
  };
};

module.exports = {
  getHealthStatus,
};