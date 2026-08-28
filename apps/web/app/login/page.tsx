"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { saveToken } from "@/lib/auth";

type LoginResponse = {
  accessToken: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("student@test.com");
  const [password, setPassword] = useState("123456");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await apiFetch<LoginResponse>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      saveToken(result.accessToken);

      router.push("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login failed",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background:
          "radial-gradient(circle at top left, rgba(79,70,229,0.10), transparent 32%), radial-gradient(circle at bottom right, rgba(99,102,241,0.07), transparent 30%), #f7f8fa",
        color: "#17191c",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
        }}
      >
        {/* Brand */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "48px",
              height: "48px",
              marginBottom: "16px",
              borderRadius: "14px",
              background:
                "linear-gradient(135deg, #4f46e5, #6366f1)",
              color: "#ffffff",
              fontSize: "20px",
              fontWeight: 800,
              boxShadow:
                "0 8px 20px rgba(79,70,229,0.22)",
            }}
          >
            AI
          </div>

          <p
            style={{
              margin: 0,
              color: "#4f46e5",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.14em",
            }}
          >
            AI LEARN
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            overflow: "hidden",
            border: "1px solid #e5e7eb",
            borderRadius: "24px",
            background: "#ffffff",
            boxShadow:
              "0 12px 40px rgba(0,0,0,0.08)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "32px 32px 24px",
              borderBottom: "1px solid #f0f1f3",
            }}
          >
            <h1
              style={{
                margin: 0,
                color: "#17191c",
                fontSize: "28px",
                fontWeight: 800,
                letterSpacing: "-0.025em",
              }}
            >
              Welcome back
            </h1>

            <p
              style={{
                margin: "8px 0 0",
                color: "#6b7280",
                fontSize: "14px",
                lineHeight: 1.6,
              }}
            >
              Sign in to continue your
              personalized learning journey.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              padding: "28px 32px 32px",
            }}
          >
            {/* Email */}
            <div
              style={{
                marginBottom: "18px",
              }}
            >
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#374151",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                required
                style={{
                  width: "100%",
                  height: "48px",
                  padding: "0 14px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius: "12px",
                  outline: "none",
                  background: "#ffffff",
                  color: "#17191c",
                  fontSize: "14px",
                  transition:
                    "border-color 0.2s ease, box-shadow 0.2s ease",
                }}
                onFocus={(event) => {
                  event.currentTarget.style.borderColor =
                    "#6366f1";
                  event.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(99,102,241,0.12)";
                }}
                onBlur={(event) => {
                  event.currentTarget.style.borderColor =
                    "#d1d5db";
                  event.currentTarget.style.boxShadow =
                    "none";
                }}
              />
            </div>

            {/* Password */}
            <div
              style={{
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <label
                  htmlFor="password"
                  style={{
                    color: "#374151",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  Password
                </label>
              </div>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                style={{
                  width: "100%",
                  height: "48px",
                  padding: "0 14px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius: "12px",
                  outline: "none",
                  background: "#ffffff",
                  color: "#17191c",
                  fontSize: "14px",
                  transition:
                    "border-color 0.2s ease, box-shadow 0.2s ease",
                }}
                onFocus={(event) => {
                  event.currentTarget.style.borderColor =
                    "#6366f1";
                  event.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(99,102,241,0.12)";
                }}
                onBlur={(event) => {
                  event.currentTarget.style.borderColor =
                    "#d1d5db";
                  event.currentTarget.style.boxShadow =
                    "none";
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  marginBottom: "18px",
                  padding: "12px 14px",
                  border:
                    "1px solid #fecaca",
                  borderLeft:
                    "4px solid #dc2626",
                  borderRadius: "10px",
                  background: "#fef2f2",
                  color: "#991b1b",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    fontWeight: 800,
                  }}
                >
                  !
                </span>

                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "50px",
                border: "none",
                borderRadius: "12px",
                background:
                  "linear-gradient(135deg, #4f46e5, #6366f1)",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 800,
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                opacity: loading ? 0.65 : 1,
                boxShadow:
                  "0 8px 18px rgba(79,70,229,0.18)",
                transition:
                  "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(event) => {
                if (!loading) {
                  event.currentTarget.style.transform =
                    "translateY(-1px)";
                  event.currentTarget.style.boxShadow =
                    "0 10px 22px rgba(79,70,229,0.24)";
                }
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform =
                  "translateY(0)";
                event.currentTarget.style.boxShadow =
                  "0 8px 18px rgba(79,70,229,0.18)";
              }}
            >
              {loading
                ? "Signing in..."
                : "Sign in →"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p
          style={{
            margin: "20px 0 0",
            textAlign: "center",
            color: "#9ca3af",
            fontSize: "12px",
          }}
        >
          AI Adaptive Learning Platform
        </p>
      </div>
    </main>
  );
}