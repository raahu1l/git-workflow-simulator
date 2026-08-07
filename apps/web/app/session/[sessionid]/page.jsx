import Terminal from "@/src/components/Terminal";

export default async function SessionPage({ params }) {
  const { sessionId } = await params;

  return (
    <main
      style={{
        padding: "40px",
      }}
    >
      <Terminal sessionId={sessionId} />
    </main>
  );
}