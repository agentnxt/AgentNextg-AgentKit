from __future__ import annotations

from collections import Counter

from .models import (
    FileChangeContext,
    Finding,
    RecommendationType,
    ReviewSummary,
    Severity,
)


class ClaudeAgentSDKReviewer:
    """Thin adapter where Claude Agent SDK execution should be integrated.

    This class keeps the code-review domain decoupled from SDK session lifecycle and
    surface adapters. For now it uses deterministic heuristics so the product remains
    fully testable in CI without external credentials.
    """

    def analyze(self, changes: list[FileChangeContext]) -> tuple[list[Finding], ReviewSummary]:
        findings: list[Finding] = []
        for ch in changes:
            patch = ch.patch.lower()
            if "password" in patch or "api_key" in patch:
                findings.append(
                    Finding(
                        title="Potential secret exposure",
                        description="Detected sensitive token-like text in patch; move values to managed secrets.",
                        file_path=ch.path,
                        line_start=1,
                        line_end=1,
                        severity=Severity.CRITICAL,
                        recommendation=RecommendationType.BLOCKING_FIX,
                    )
                )
            if "except:" in patch:
                findings.append(
                    Finding(
                        title="Bare exception handler",
                        description="Bare except can hide operational failures and makes incident debugging harder.",
                        file_path=ch.path,
                        line_start=1,
                        line_end=1,
                        severity=Severity.MEDIUM,
                        recommendation=RecommendationType.HARDENING,
                    )
                )
            if "print(" in patch:
                findings.append(
                    Finding(
                        title="Direct print statement",
                        description="Use structured logging for production observability instead of print statements.",
                        file_path=ch.path,
                        line_start=1,
                        line_end=1,
                        severity=Severity.LOW,
                        recommendation=RecommendationType.OBSERVABILITY,
                    )
                )

        if not findings:
            findings.append(
                Finding(
                    title="No major risks detected",
                    description="No critical anti-patterns identified in this initial scan.",
                    file_path=changes[0].path,
                    line_start=1,
                    line_end=1,
                    severity=Severity.INFO,
                    recommendation=RecommendationType.DOCUMENTATION,
                )
            )

        counts = Counter(f.severity for f in findings)
        risk_score = min(100, counts[Severity.CRITICAL] * 35 + counts[Severity.HIGH] * 20 + counts[Severity.MEDIUM] * 10 + counts[Severity.LOW] * 4)
        summary = ReviewSummary(
            overview="Automated code review completed with structured findings.",
            risk_score=risk_score,
            by_severity={sev: counts.get(sev, 0) for sev in Severity},
            next_actions=["Resolve critical/high findings before merge", "Track hardening items in sprint backlog"],
        )
        return findings, summary
