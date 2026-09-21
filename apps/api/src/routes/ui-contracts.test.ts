// @vitest-environment node

import { readFileSync } from "node:fs";
import Fastify from "fastify";
import jwt from "@fastify/jwt";
import { afterEach, describe, expect, it } from "vitest";
import { authRoutes } from "./auth.js";

const apps: Array<ReturnType<typeof Fastify>> = [];

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

describe("UI-facing API contracts", () => {
  it("returns the username after login", async () => {
    const app = Fastify();
    apps.push(app);
    await app.register(jwt, { secret: "test-only-secret" });
    await app.register(authRoutes);

    await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        username: "test-user",
        email: "ui-contract@example.com",
        password: "password",
      },
    });

    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "ui-contract@example.com", password: "password" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().user).toMatchObject({ username: "test-user" });
  });

  it("declares DELETE in the browser CORS methods", () => {
    const source = readFileSync(new URL("../index.ts", import.meta.url), "utf8");
    const methods = source.match(/methods:\s*\[([^\]]+)\]/)?.[1] ?? "";

    expect(methods).toContain('"DELETE"');
  });
});
