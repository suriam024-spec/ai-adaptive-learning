"use client";

import { useState } from "react";

import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

type AiTutorResponse = {
  lesson: {
    id: string;
    title: string;
  };
  question: string;
  answer: string;
  tutor: {
    mode: string;
  };
};

type AiTutorProps = {
  lessonId: string;
};

export default function AiTutor({
  lessonId,
}: AiTutorProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function askTutor() {
    const token = getToken();

    if (!token) {
      setError("Please login again.");
      return;
    }

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setError("Please enter a question.");
      return;
    }

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const data =
        await apiFetch<AiTutorResponse>(
          "/ai/tutor",
          {
            method: "POST",
            token,
            body: JSON.stringify({
              lessonId,
              question: trimmedQuestion,
            }),
          },
        );

      setAnswer(data.answer);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to ask AI Tutor",
      );
    } finally {
      setLoading(false);
    }
  }

  function useExample(text: string) {
    setQuestion(text);
    setError("");
  }

  return (
    <section className="ai-tutor">

      {/* Header */}

      <div className="tutor-header">

        <div className="tutor-brand">

          <div className="tutor-icon">
            ✦
          </div>

          <div>
            <div className="tutor-label">
              AI ASSISTANT
            </div>

            <h2 className="tutor-title">
              AI Tutor
            </h2>
          </div>

        </div>

        <div className="tutor-badge">
          GEMINI
        </div>

      </div>

      <p className="tutor-description">
        Ask anything about this lesson. I can explain
        difficult concepts, give examples, or help you
        understand the topic step by step.
      </p>

      {/* Example Questions */}

      <div className="examples">

        <div className="examples-label">
          TRY ASKING
        </div>

        <div className="example-list">

          <button
            type="button"
            onClick={() =>
              useExample(
                "ช่วยอธิบายบทเรียนนี้แบบง่าย ๆ ให้ผมเข้าใจหน่อย",
              )
            }
            className="example-button"
          >
            <span className="example-icon">
              ?
            </span>

            <span>
              อธิบายบทเรียนนี้แบบง่าย ๆ
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              useExample(
                "ช่วยยกตัวอย่างจากเรื่องนี้ให้หน่อย",
              )
            }
            className="example-button"
          >
            <span className="example-icon">
              +
            </span>

            <span>
              ขอ example เพิ่มเติม
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              useExample(
                "ช่วยอธิบายส่วนที่ยากที่สุดของบทเรียนนี้",
              )
            }
            className="example-button"
          >
            <span className="example-icon">
              !
            </span>

            <span>
              อธิบายส่วนที่ยาก
            </span>
          </button>

        </div>

      </div>

      {/* Question */}

      <div className="question-area">

        <label
          htmlFor="ai-tutor-question"
          className="question-label"
        >
          YOUR QUESTION
        </label>

        <div className="input-wrapper">

          <textarea
            id="ai-tutor-question"
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                (event.ctrlKey || event.metaKey)
              ) {
                event.preventDefault();
                askTutor();
              }
            }}
            placeholder="Ask something about this lesson..."
            rows={4}
            disabled={loading}
            className="question-input"
          />

          <div className="input-footer">

            <span className="keyboard-hint">
              Ctrl + Enter to ask
            </span>

            <button
              type="button"
              onClick={askTutor}
              disabled={
                loading ||
                !question.trim()
              }
              className="ask-button"
            >
              {loading ? (
                <>
                  <span className="button-spinner" />
                  Thinking...
                </>
              ) : (
                <>
                  Ask Tutor
                  <span className="button-arrow">
                    →
                  </span>
                </>
              )}
            </button>

          </div>

        </div>

      </div>

      {/* Error */}

      {error && (
        <div className="error-message">

          <div className="error-icon">
            !
          </div>

          <div>
            <strong>
              Something went wrong
            </strong>

            <p>
              {error}
            </p>
          </div>

        </div>
      )}

      {/* Answer */}

      {answer && (
        <div className="answer-section">

          <div className="answer-header">

            <div className="answer-title-wrapper">

              <div className="answer-icon">
                ✦
              </div>

              <div>
                <div className="answer-label">
                  AI TUTOR
                </div>

                <h3 className="answer-title">
                  Here's what I think
                </h3>
              </div>

            </div>

            <span className="answer-badge">
              { "AI" }
            </span>

          </div>

          <div className="answer-question">
            <span className="question-mark">
              Q
            </span>

            <span>
              {question}
            </span>
          </div>

          <div className="answer-content">
            {answer}
          </div>

        </div>
      )}

      {/* Empty State */}

      {!answer && !loading && !error && (
        <div className="empty-state">

          <div className="empty-icon">
            ✦
          </div>

          <div>
            <strong>
              Your AI Tutor is ready
            </strong>

            <p>
              Ask a question whenever you need help
              understanding this lesson.
            </p>
          </div>

        </div>
      )}

      <style jsx>{`
        /* =====================================================
           AI TUTOR
           Matches Lesson Page Design
           ===================================================== */

        .ai-tutor {
          padding: 24px;
          background: #ffffff;
          color: #17191c;
        }

        /* Header */

        .tutor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .tutor-brand {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .tutor-icon {
          display: grid;
          width: 46px;
          height: 46px;
          place-items: center;
          border-radius: 13px;
          background:
            linear-gradient(
              135deg,
              #4f46e5,
              #6366f1
            );
          color: #ffffff;
          font-size: 20px;
          font-weight: 800;
          box-shadow:
            0 7px 16px rgba(79, 70, 229, 0.2);
        }

        .tutor-label {
          margin-bottom: 2px;
          color: #4f46e5;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.14em;
        }

        .tutor-title {
          margin: 0;
          color: #17191c;
          font-size: 21px;
          font-weight: 800;
          letter-spacing: -0.015em;
        }

        .tutor-badge {
          padding: 7px 10px;
          border: 1px solid #c7d2fe;
          border-radius: 999px;
          background: #eef2ff;
          color: #4338ca;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .tutor-description {
          max-width: 680px;
          margin: 14px 0 0;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.65;
        }

        /* Examples */

        .examples {
          margin-top: 23px;
        }

        .examples-label {
          margin-bottom: 9px;
          color: #6b7280;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        .example-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .example-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 36px;
          padding: 7px 11px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: #f9fafb;
          color: #4b5563;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .example-button:hover {
          border-color: #c7d2fe;
          background: #eef2ff;
          color: #4338ca;
          transform: translateY(-1px);
        }

        .example-icon {
          display: grid;
          width: 20px;
          height: 20px;
          place-items: center;
          border-radius: 6px;
          background: #eef2ff;
          color: #4f46e5;
          font-size: 11px;
          font-weight: 800;
        }

        /* Question */

        .question-area {
          margin-top: 25px;
        }

        .question-label {
          display: block;
          margin-bottom: 8px;
          color: #374151;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        .input-wrapper {
          overflow: hidden;
          border: 1px solid #d1d5db;
          border-radius: 14px;
          background: #ffffff;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .input-wrapper:focus-within {
          border-color: #6366f1;
          box-shadow:
            0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .question-input {
          display: block;
          width: 100%;
          min-height: 105px;
          padding: 15px 16px;
          border: 0;
          outline: none;
          resize: vertical;
          background: #ffffff;
          color: #17191c;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.7;
          box-sizing: border-box;
        }

        .question-input::placeholder {
          color: #9ca3af;
        }

        .question-input:disabled {
          background: #f9fafb;
          cursor: not-allowed;
        }

        .input-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 10px 10px 15px;
          border-top: 1px solid #f0f1f3;
          background: #fafafa;
        }

        .keyboard-hint {
          color: #9ca3af;
          font-size: 11px;
        }

        .ask-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 40px;
          padding: 9px 15px;
          border: 0;
          border-radius: 10px;
          background:
            linear-gradient(
              135deg,
              #4f46e5,
              #6366f1
            );
          color: #ffffff;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          box-shadow:
            0 5px 13px rgba(79, 70, 229, 0.18);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            opacity 0.2s ease;
        }

        .ask-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow:
            0 7px 17px rgba(79, 70, 229, 0.24);
        }

        .ask-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }

        .button-arrow {
          font-size: 15px;
        }

        .button-spinner {
          width: 13px;
          height: 13px;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* Error */

        .error-message {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          margin-top: 18px;
          padding: 13px 14px;
          border: 1px solid #fecaca;
          border-left: 4px solid #dc2626;
          border-radius: 11px;
          background: #fef2f2;
          color: #991b1b;
        }

        .error-icon {
          display: grid;
          flex-shrink: 0;
          width: 25px;
          height: 25px;
          place-items: center;
          border-radius: 50%;
          background: #fee2e2;
          color: #dc2626;
          font-size: 12px;
          font-weight: 800;
        }

        .error-message strong {
          font-size: 12px;
          font-weight: 800;
        }

        .error-message p {
          margin: 3px 0 0;
          color: #b91c1c;
          font-size: 12px;
          line-height: 1.5;
        }

        /* Answer */

        .answer-section {
          margin-top: 24px;
          overflow: hidden;
          border: 1px solid #c7d2fe;
          border-radius: 15px;
          background:
            linear-gradient(
              135deg,
              #ffffff,
              #f8f9ff
            );
        }

        .answer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 16px 17px;
          border-bottom: 1px solid #e0e7ff;
          background: rgba(238, 242, 255, 0.55);
        }

        .answer-title-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .answer-icon {
          display: grid;
          width: 34px;
          height: 34px;
          place-items: center;
          border-radius: 9px;
          background: #4f46e5;
          color: #ffffff;
          font-size: 15px;
          font-weight: 800;
        }

        .answer-label {
          margin-bottom: 1px;
          color: #4f46e5;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        .answer-title {
          margin: 0;
          color: #17191c;
          font-size: 14px;
          font-weight: 800;
        }

        .answer-badge {
          padding: 5px 8px;
          border: 1px solid #c7d2fe;
          border-radius: 7px;
          background: #ffffff;
          color: #6366f1;
          font-size: 9px;
          font-weight: 800;
        }

        .answer-question {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin: 15px 17px 0;
          padding: 10px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: #ffffff;
          color: #6b7280;
          font-size: 12px;
          line-height: 1.5;
        }

        .question-mark {
          display: grid;
          flex-shrink: 0;
          width: 21px;
          height: 21px;
          place-items: center;
          border-radius: 6px;
          background: #f3f4f6;
          color: #6b7280;
          font-size: 9px;
          font-weight: 800;
        }

        .answer-content {
          padding: 19px 17px 21px;
          color: #374151;
          font-size: 14px;
          line-height: 1.9;
          white-space: pre-wrap;
        }

        /* Empty */

        .empty-state {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 20px;
          padding: 13px 15px;
          border: 1px dashed #d1d5db;
          border-radius: 12px;
          background: #fafafa;
        }

        .empty-icon {
          display: grid;
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          place-items: center;
          border-radius: 9px;
          background: #eef2ff;
          color: #4f46e5;
          font-size: 14px;
          font-weight: 800;
        }

        .empty-state strong {
          color: #374151;
          font-size: 12px;
          font-weight: 800;
        }

        .empty-state p {
          margin: 2px 0 0;
          color: #9ca3af;
          font-size: 11px;
          line-height: 1.5;
        }

        /* Animation */

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Mobile */

        @media (max-width: 600px) {
          .ai-tutor {
            padding: 20px;
          }

          .tutor-header {
            align-items: flex-start;
          }

          .tutor-badge {
            display: none;
          }

          .example-list {
            flex-direction: column;
          }

          .example-button {
            width: 100%;
            justify-content: flex-start;
          }

          .input-footer {
            align-items: flex-end;
          }

          .keyboard-hint {
            max-width: 120px;
            line-height: 1.4;
          }

          .ask-button {
            flex-shrink: 0;
          }
        }

        @media (max-width: 420px) {
          .ai-tutor {
            padding: 17px;
          }

          .tutor-title {
            font-size: 19px;
          }

          .tutor-description {
            font-size: 13px;
          }

          .question-input {
            min-height: 95px;
          }

          .input-footer {
            padding: 9px;
          }

          .keyboard-hint {
            display: none;
          }

          .ask-button {
            width: 100%;
          }

          .input-footer {
            justify-content: stretch;
          }
        }
      `}</style>
    </section>
  );
}
