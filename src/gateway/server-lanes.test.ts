import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_AGENT_MAX_CONCURRENT } from "../config/agent-limits.js";
import { CommandLane } from "../process/lanes.js";

const setCommandLaneConcurrency = vi.fn();

vi.mock("../process/command-queue.js", () => ({
  setCommandLaneConcurrency: (lane: string, max: number) => setCommandLaneConcurrency(lane, max),
}));

describe("applyGatewayLaneConcurrency", () => {
  beforeEach(() => {
    setCommandLaneConcurrency.mockClear();
  });

  it("configures the nested lane so sessions_send agent-to-agent runs are not serialized", async () => {
    const { applyGatewayLaneConcurrency } = await import("./server-lanes.js");

    applyGatewayLaneConcurrency({
      agents: { defaults: { maxConcurrent: 50 } },
    });

    const calls = setCommandLaneConcurrency.mock.calls;
    const lanes = calls.map(([lane]) => lane);
    expect(lanes).toContain(CommandLane.Nested);

    const nestedCall = calls.find(([lane]) => lane === CommandLane.Nested);
    expect(nestedCall?.[1]).toBe(50);
  });

  it("falls back to the default agent max concurrent for the nested lane", async () => {
    const { applyGatewayLaneConcurrency } = await import("./server-lanes.js");

    applyGatewayLaneConcurrency({});

    const nestedCall = setCommandLaneConcurrency.mock.calls.find(
      ([lane]) => lane === CommandLane.Nested,
    );
    expect(nestedCall?.[1]).toBe(DEFAULT_AGENT_MAX_CONCURRENT);
  });
});
