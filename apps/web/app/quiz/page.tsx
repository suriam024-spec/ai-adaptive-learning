import { Suspense } from "react";

import QuizClient from "./QuizClient";

function QuizLoading() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#f7f8fa",
      }}
    >
      <p
        style={{
          color: "#6b7280",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: "14px",
        }}
      >
        Loading quiz...
      </p>
    </main>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<QuizLoading />}>
      <QuizClient />
    </Suspense>
  );
}