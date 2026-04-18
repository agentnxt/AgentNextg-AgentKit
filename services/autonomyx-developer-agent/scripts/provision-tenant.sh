#!/usr/bin/env bash
# Provision a new tenant with TWO role-scoped LiteLLM virtual keys:
#   - Claude key    (reviewer only; Anthropic models allowlist, small budget)
#   - Worker key (workers only;  local models allowlist,      larger budget)
# Both belong to the same LiteLLM team so spend rolls up to one tenant bill.
#
# Usage:
#   LITELLM_MASTER_KEY=sk-... GATEWAY_URL=https://llm.openautonomyx.com \
#     ./scripts/provision-tenant.sh <tenant-slug> [claude_budget] [worker_budget]
#
# Example:
#   ./scripts/provision-tenant.sh acme-corp 50 200

set -euo pipefail

TENANT="${1:?usage: provision-tenant.sh <tenant-slug> [claude_budget] [oh_budget]}"
CLAUDE_BUDGET="${2:-50}"
OH_BUDGET="${3:-200}"

: "${LITELLM_MASTER_KEY:?must set LITELLM_MASTER_KEY}"
GATEWAY_URL="${GATEWAY_URL:-https://llm.openautonomyx.com}"

# Model allowlists — EDIT to match what's registered in your LiteLLM config.yaml
CLAUDE_MODELS='["claude-opus-4-7","claude-sonnet-4-6","claude-haiku-4-5"]'
WORKER_MODELS='["openai/qwen2.5-coder:32b","openai/deepseek-coder:33b"]'

gen_key() {
    local alias="$1" budget="$2" models="$3" role="$4"
    curl -sS -X POST "${GATEWAY_URL%/}/key/generate" \
        -H "Authorization: Bearer ${LITELLM_MASTER_KEY}" \
        -H "Content-Type: application/json" \
        -d "$(cat <<JSON
{
  "key_alias": "${alias}",
  "max_budget": ${budget},
  "budget_duration": "30d",
  "models": ${models},
  "team_id": "tenant-${TENANT}",
  "metadata": {"tenant": "${TENANT}", "role": "${role}"}
}
JSON
)" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("key",""))'
}

CLAUDE_KEY=$(gen_key "tenant-${TENANT}-claude" "${CLAUDE_BUDGET}" "${CLAUDE_MODELS}" "claude")
OH_KEY=$(gen_key "tenant-${TENANT}-worker" "${OH_BUDGET}" "${WORKER_MODELS}" "worker")

if [[ -z "$CLAUDE_KEY" || -z "$OH_KEY" ]]; then
    echo "ERROR: one or both keys failed to generate." >&2
    exit 1
fi

cat <<EOF
Tenant provisioned:    ${TENANT}
Claude budget:         \$${CLAUDE_BUDGET}/month  (allowlist: ${CLAUDE_MODELS})
Worker budget:      \$${OH_BUDGET}/month      (allowlist: ${WORKER_MODELS})

Add to the tenant's .env:
  GATEWAY_MODE=managed
  GATEWAY_URL=${GATEWAY_URL%/}
  CLAUDE_VIRTUAL_KEY=${CLAUDE_KEY}
  WORKER_VIRTUAL_KEY=${OH_KEY}
  # ANTHROPIC_API_KEY and LLM_API_KEY are auto-wired from the above at startup.

Keep GATEWAY_ADMIN_KEY server-side only (used by /usage to read spend logs).
EOF
