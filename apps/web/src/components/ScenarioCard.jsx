"use client";

import { useRouter } from "next/navigation";

export default function ScenarioCard({ scenario }) {
  const router = useRouter();

  const startScenario = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/scenarios/${scenario.id}/start`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      console.log("Response:", data);

      router.push(`/session/${data.sessionId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to start scenario.");
    }
  };

  return (
    <div
      style={{
        border: "1px solid #333",
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "20px",
      }}
    >
      <h2>{scenario.title}</h2>

      <p>Difficulty: {scenario.difficulty}</p>

      <button
        onClick={startScenario}
        style={{
          marginTop: "10px",
          padding: "10px 16px",
          cursor: "pointer",
        }}
      >
        Start Scenario
      </button>
    </div>
  );
}