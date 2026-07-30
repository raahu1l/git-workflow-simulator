const getAllScenarios = () => {
  return [
    {
      id: "first-commit",
      title: "First Commit",
      difficulty: "Beginner",
    },
    {
      id: "merge-conflict",
      title: "Merge Conflict",
      difficulty: "Intermediate",
    },
  ];
};

module.exports = {
  getAllScenarios,
};