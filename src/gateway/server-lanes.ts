import { resolveAgentMaxConcurrent, resolveSubagentMaxConcurrent } from "../config/agent-limits.js";
import type { OpenClawConfig } from "../config/types.openclaw.js";
import { setCommandLaneConcurrency } from "../process/command-queue.js";
import { CommandLane } from "../process/lanes.js";

export function applyGatewayLaneConcurrency(cfg: OpenClawConfig) {
  setCommandLaneConcurrency(CommandLane.Cron, cfg.cron?.maxConcurrentRuns ?? 1);
  setCommandLaneConcurrency(CommandLane.Main, resolveAgentMaxConcurrent(cfg));
  setCommandLaneConcurrency(CommandLane.Subagent, resolveSubagentMaxConcurrent(cfg));
  // Nested runs (sessions_send agent-to-agent, cron-initiated inner ops) share
  // the main agent-lane budget so peer sends aren't serialized through the
  // queue's default maxConcurrent=1.
  setCommandLaneConcurrency(CommandLane.Nested, resolveAgentMaxConcurrent(cfg));
}
