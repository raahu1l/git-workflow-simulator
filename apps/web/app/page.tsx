export default async function Home() {
  const response = await fetch("http://localhost:5000/api/health", {
    cache: "no-store",
  });

  const data = await response.json();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Git Workflow Simulator</h1>

      <p>Backend Status: {data.status}</p>

      <p>{data.message}</p>
    </main>
  );
}