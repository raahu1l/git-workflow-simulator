type Scenario = {
  id: string;
  title: string;
  difficulty: string;
};

export default async function Home() {
  const response = await fetch("http://localhost:5000/api/scenarios", {
    cache: "no-store",
  });

  const scenarios: Scenario[] = await response.json();

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Git Workflow Simulator</h1>

      <div className="space-y-4">
        {scenarios.map((scenario) => (
          <div
            key={scenario.id}
            className="border rounded-lg p-4 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{scenario.title}</h2>
            <p>Difficulty: {scenario.difficulty}</p>
          </div>
        ))}
      </div>
    </main>
  );
}