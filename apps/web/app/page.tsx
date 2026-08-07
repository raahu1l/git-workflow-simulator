type Scenario = {
  id: string;
  title: string;
  difficulty: string;
};

import ScenarioCard from "@/src/components/ScenarioCard";

export default async function Home() {
  const response = await fetch("http://localhost:5000/api/scenarios", {
    cache: "no-store",
  });

  const scenarios: Scenario[] = await response.json();

  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          marginBottom: "10px",
        }}
      >
        Git Workflow Simulator
      </h1>

      <p
        style={{
          color: "#666",
          marginBottom: "40px",
        }}
      >
        Learn Git by solving real terminal exercises.
      </p>

      {scenarios.map((scenario) => (
        <ScenarioCard
          key={scenario.id}
          scenario={scenario}
        />
      ))}
    </main>
  );
}