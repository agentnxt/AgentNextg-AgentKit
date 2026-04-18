"""
Review rubric Claude applies to code produced by workers.

This is YOUR contribution — the domain-specific rules for what makes a
delegated change acceptable. Claude receives this string verbatim in its
system prompt, so phrase it as instructions to a reviewer.

Trade-offs to consider:
- Strict rules reject more Worker output but produce cleaner merges.
- Loose rules accept more but push review burden back to you.
- Security-first rules are cheap to enforce and catch real problems.
"""


def get_review_criteria() -> str:
    # Thresholds below are defaults — adjust LARGE_FILE_LOC and LARGE_BINARY_KB
    # in the text to match your repo's actual standards.
    return """
    Review every Worker diff against ALL of the following. Approve only
    if every rule passes; otherwise CHANGES_REQUESTED with the specific rule
    number(s) that failed and what to fix.

    1. BEST PRACTICES — code follows idiomatic patterns for the language.
       No copy-paste duplication, no dead code, no obvious anti-patterns
       (bare except, mutable default args, global state where avoidable,
       swallowed errors, magic numbers without named constants).

    2. TESTS — every new public function or changed behavior has at least
       one accompanying test. Tests must actually assert behavior, not just
       call the function. If the repo already has a test framework, use it.

    3. COMMENTS / DOCSTRINGS — every public function, class, and module has
       a short docstring stating purpose. Non-obvious logic (workarounds,
       invariants, tricky algorithms) has an inline comment explaining WHY.
       Reject noise comments that only restate what the code already says.

    4. LOGIC IMPLEMENTED — no stubs, no `pass`, no `raise NotImplementedError`,
       no `TODO:` markers left in the diff. Every code path that the task
       required is actually implemented and reachable.

    5. CI/CD COMPATIBILITY — the change must not break existing CI. If the
       project has workflow files (.github/workflows, .gitlab-ci.yml, etc.)
       and this change needs new build/test steps, those steps must be
       added in the same diff. Do not remove or disable existing CI checks.

    6. NO LARGE FILES — no single source file added exceeds 500 lines.
       No binary or asset exceeds 100 KB. Generated files, fixtures, or
       bundled dependencies must be justified in the worker's output or
       rejected.

    Output format — return a JSON object per worker:
      {"agent_id": "...", "decision": "APPROVED|CHANGES_REQUESTED|REJECTED",
       "failed_rules": [1,3], "required_changes": ["..."], "notes": "..."}
    """.strip()
