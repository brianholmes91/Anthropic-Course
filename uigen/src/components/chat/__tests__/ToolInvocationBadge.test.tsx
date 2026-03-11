import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge, getToolLabel } from "../ToolInvocationBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

// --- getToolLabel unit tests ---

function makeInvocation(
  toolName: string,
  args: Record<string, string>,
  state: "call" | "result" = "result",
  result: unknown = "ok"
): ToolInvocation {
  if (state === "result") {
    return { toolCallId: "1", toolName, args, state: "result", result } as ToolInvocation;
  }
  return { toolCallId: "1", toolName, args, state: "call" } as ToolInvocation;
}

test("getToolLabel: str_replace_editor create", () => {
  expect(
    getToolLabel(makeInvocation("str_replace_editor", { command: "create", path: "/src/components/Button.tsx" }))
  ).toBe("Creating Button.tsx");
});

test("getToolLabel: str_replace_editor str_replace", () => {
  expect(
    getToolLabel(makeInvocation("str_replace_editor", { command: "str_replace", path: "/src/App.tsx" }))
  ).toBe("Editing App.tsx");
});

test("getToolLabel: str_replace_editor insert", () => {
  expect(
    getToolLabel(makeInvocation("str_replace_editor", { command: "insert", path: "/src/index.ts" }))
  ).toBe("Editing index.ts");
});

test("getToolLabel: str_replace_editor view", () => {
  expect(
    getToolLabel(makeInvocation("str_replace_editor", { command: "view", path: "/src/utils.ts" }))
  ).toBe("Viewing utils.ts");
});

test("getToolLabel: file_manager delete", () => {
  expect(
    getToolLabel(makeInvocation("file_manager", { command: "delete", path: "/src/old.tsx" }))
  ).toBe("Deleting old.tsx");
});

test("getToolLabel: file_manager rename", () => {
  expect(
    getToolLabel(
      makeInvocation("file_manager", {
        command: "rename",
        path: "/src/Foo.tsx",
        new_path: "/src/Bar.tsx",
      })
    )
  ).toBe("Renaming Foo.tsx → Bar.tsx");
});

test("getToolLabel: unknown tool falls back to toolName", () => {
  expect(
    getToolLabel(makeInvocation("some_other_tool", {}))
  ).toBe("some_other_tool");
});

// --- ToolInvocationBadge rendering tests ---

test("ToolInvocationBadge shows label for completed str_replace_editor create", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/src/Card.tsx" })}
    />
  );
  expect(screen.getByText("Creating Card.tsx")).toBeDefined();
});

test("ToolInvocationBadge shows label for in-progress str_replace_editor edit", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "str_replace", path: "/src/Form.tsx" }, "call")}
    />
  );
  expect(screen.getByText("Editing Form.tsx")).toBeDefined();
});

test("ToolInvocationBadge shows green dot when done", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/src/A.tsx" }, "result", "ok")}
    />
  );
  const dot = container.querySelector(".bg-emerald-500");
  expect(dot).toBeTruthy();
});

test("ToolInvocationBadge shows spinner when in progress", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/src/A.tsx" }, "call")}
    />
  );
  const spinner = container.querySelector(".animate-spin");
  expect(spinner).toBeTruthy();
});

test("ToolInvocationBadge shows file_manager delete label", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("file_manager", { command: "delete", path: "/src/Unused.tsx" })}
    />
  );
  expect(screen.getByText("Deleting Unused.tsx")).toBeDefined();
});

test("ToolInvocationBadge shows file_manager rename label", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("file_manager", {
        command: "rename",
        path: "/src/Old.tsx",
        new_path: "/src/New.tsx",
      })}
    />
  );
  expect(screen.getByText("Renaming Old.tsx → New.tsx")).toBeDefined();
});
