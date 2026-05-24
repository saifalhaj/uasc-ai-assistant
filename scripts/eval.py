"""Eval harness for the UASC agent.

Runs a YAML file of test questions against the deployed backend and reports
retrieval recall and answer correctness.

Usage:
    python scripts/eval.py [--questions scripts/eval_questions.yaml] [--api-url https://...]

Runnable locally against the cloud backend or as a scheduled Render job.
"""

import argparse
import asyncio
import json
import os
import sys
import time
from dataclasses import dataclass, field
from typing import Any

import httpx
import yaml


@dataclass
class EvalQuestion:
    id: str
    question: str
    expected_keywords: list[str] = field(default_factory=list)
    expected_classification: str | None = None
    notes: str = ""


@dataclass
class EvalResult:
    question_id: str
    question: str
    answer: str
    citations_count: int
    confidence: float
    escalation_flag: bool
    latency_ms: int
    keyword_recall: float
    passed: bool
    error: str | None = None


def load_questions(path: str) -> list[EvalQuestion]:
    with open(path) as f:
        raw = yaml.safe_load(f)
    return [
        EvalQuestion(
            id=q["id"],
            question=q["question"],
            expected_keywords=q.get("expected_keywords", []),
            expected_classification=q.get("expected_classification"),
            notes=q.get("notes", ""),
        )
        for q in raw["questions"]
    ]


async def run_question(
    client: httpx.AsyncClient, api_url: str, eq: EvalQuestion
) -> EvalResult:
    start = time.monotonic()
    try:
        resp = await client.post(
            f"{api_url}/chat",
            json={"question": eq.question, "top_k": 5},
            timeout=60,
        )
        resp.raise_for_status()
        data = resp.json()
        latency_ms = int((time.monotonic() - start) * 1000)

        answer = data.get("answer", "")
        answer_lower = answer.lower()
        matched = sum(
            1 for kw in eq.expected_keywords if kw.lower() in answer_lower
        )
        keyword_recall = (
            matched / len(eq.expected_keywords) if eq.expected_keywords else 1.0
        )

        return EvalResult(
            question_id=eq.id,
            question=eq.question,
            answer=answer[:200],
            citations_count=len(data.get("citations", [])),
            confidence=data.get("confidence", 0.0),
            escalation_flag=data.get("escalation_flag", False),
            latency_ms=latency_ms,
            keyword_recall=keyword_recall,
            passed=keyword_recall >= 0.5,
        )
    except Exception as exc:
        return EvalResult(
            question_id=eq.id,
            question=eq.question,
            answer="",
            citations_count=0,
            confidence=0.0,
            escalation_flag=False,
            latency_ms=int((time.monotonic() - start) * 1000),
            keyword_recall=0.0,
            passed=False,
            error=str(exc),
        )


async def main(api_url: str, questions_path: str) -> None:
    questions = load_questions(questions_path)
    print(f"Running {len(questions)} eval questions against {api_url}\n")

    async with httpx.AsyncClient() as client:
        results = await asyncio.gather(*[run_question(client, api_url, q) for q in questions])

    passed = sum(1 for r in results if r.passed)
    avg_recall = sum(r.keyword_recall for r in results) / len(results)
    avg_latency = sum(r.latency_ms for r in results) / len(results)

    print(f"{'ID':<12} {'Pass':<6} {'Recall':<8} {'Citations':<10} {'Latency':<10} Question")
    print("-" * 80)
    for r in results:
        status = "PASS" if r.passed else "FAIL"
        print(
            f"{r.question_id:<12} {status:<6} {r.keyword_recall:<8.2f} {r.citations_count:<10} "
            f"{r.latency_ms:<10}ms {r.question[:50]}"
        )
        if r.error:
            print(f"  ERROR: {r.error}")

    print(f"\nSummary: {passed}/{len(results)} passed | avg recall={avg_recall:.2f} | avg latency={avg_latency:.0f}ms")

    if passed < len(results):
        sys.exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="UASC eval harness")
    parser.add_argument(
        "--api-url",
        default=os.getenv("API_URL", "http://localhost:8000"),
        help="Backend API URL",
    )
    parser.add_argument(
        "--questions",
        default=os.path.join(os.path.dirname(__file__), "eval_questions.yaml"),
        help="Path to YAML questions file",
    )
    args = parser.parse_args()
    asyncio.run(main(args.api_url, args.questions))
