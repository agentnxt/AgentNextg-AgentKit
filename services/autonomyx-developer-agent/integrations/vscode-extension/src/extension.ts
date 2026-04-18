import * as vscode from "vscode";

interface ReviewResponse {
  session_id: string;
  status: string;
}

function serverUrl(): string {
  return vscode.workspace
    .getConfiguration("autonomyxDev")
    .get<string>("serverUrl", "http://127.0.0.1:8080")
    .replace(/\/$/, "");
}

async function postReview(task: string): Promise<ReviewResponse> {
  const resp = await fetch(`${serverUrl()}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task, source: "vscode" })
  });
  if (!resp.ok) {
    throw new Error(`Server returned ${resp.status}: ${await resp.text()}`);
  }
  return (await resp.json()) as ReviewResponse;
}

async function streamSession(
  sessionId: string,
  channel: vscode.OutputChannel,
  token: vscode.CancellationToken
): Promise<void> {
  const url = `${serverUrl()}/review/${sessionId}/events`;
  const resp = await fetch(url);
  if (!resp.body) {
    channel.appendLine("[error] no event stream body");
    return;
  }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (!token.isCancellationRequested) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const parts = buf.split("\n\n");
    buf = parts.pop() ?? "";
    for (const block of parts) {
      const dataLine = block.split("\n").find((l) => l.startsWith("data:"));
      if (!dataLine) continue;
      try {
        const ev = JSON.parse(dataLine.slice(5).trim());
        renderEvent(ev, channel);
        if (ev.type === "status" && (ev.status === "completed" || ev.status === "failed")) {
          return;
        }
      } catch {
        // skip malformed frames
      }
    }
  }
}

function renderEvent(ev: any, channel: vscode.OutputChannel): void {
  switch (ev.type) {
    case "status":
      channel.appendLine(`[status] ${ev.status}${ev.error ? ` — ${ev.error}` : ""}`);
      break;
    case "tool_call":
      channel.appendLine(`[tool] ${ev.name} ${JSON.stringify(ev.input).slice(0, 200)}`);
      break;
    case "text":
      channel.appendLine(`[claude] ${ev.text}`);
      break;
    case "result":
      channel.appendLine(
        `[result] cost=$${(ev.cost_usd ?? 0).toFixed(4)} tokens_in=${ev.input_tokens ?? "?"} tokens_out=${ev.output_tokens ?? "?"}`
      );
      if (ev.result) channel.appendLine(ev.result);
      break;
  }
}

export function activate(ctx: vscode.ExtensionContext): void {
  const channel = vscode.window.createOutputChannel("Autonomyx Dev");

  ctx.subscriptions.push(
    vscode.commands.registerCommand("autonomyxDev.review", async () => {
      const task = await vscode.window.showInputBox({
        prompt: "Describe the coding task to delegate to Worker",
        placeHolder: "e.g., add a /healthz endpoint to the flask app"
      });
      if (!task) return;
      channel.show(true);
      channel.appendLine(`> ${task}`);
      let session: ReviewResponse;
      try {
        session = await postReview(task);
      } catch (e: any) {
        vscode.window.showErrorMessage(`Failed to queue review: ${e.message}`);
        return;
      }
      channel.appendLine(`[queued] session=${session.session_id}`);
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Reviewing: ${task.slice(0, 60)}…`,
          cancellable: true
        },
        (_progress, token) => streamSession(session.session_id, channel, token)
      );
    })
  );

  ctx.subscriptions.push(
    vscode.commands.registerCommand("autonomyxDev.openSession", async () => {
      const id = await vscode.window.showInputBox({ prompt: "Session ID (rs-…)" });
      if (!id) return;
      channel.show(true);
      await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: `Following ${id}`, cancellable: true },
        (_p, token) => streamSession(id, channel, token)
      );
    })
  );
}

export function deactivate(): void {}
