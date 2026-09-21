// @vitest-environment node

import Fastify, { type FastifyInstance } from "fastify";
import jwt from "@fastify/jwt";
import { afterEach, describe, expect, it } from "vitest";
import type { AuthResponse, Cart } from "@acme/shared";
import { authRoutes } from "./auth.js";
import { cartRoutes } from "./cart.js";

const apps: FastifyInstance[] = [];

async function buildApp({ preverify = false } = {}) {
  const app = Fastify();
  apps.push(app);
  await app.register(jwt, { secret: "synthetic-authz-test-secret" });

  if (preverify) {
    app.addHook("onRequest", async (request) => {
      if (request.headers.authorization) {
        await request.jwtVerify();
      }
    });
  }

  await app.register(authRoutes);
  await app.register(cartRoutes);
  return app;
}

async function registerUser(app: FastifyInstance, suffix: string) {
  const response = await app.inject({
    method: "POST",
    url: "/auth/register",
    payload: {
      username: `authz-${suffix}`,
      email: `authz-${suffix}@example.com`,
      password: "synthetic-password",
    },
  });

  expect(response.statusCode).toBe(201);
  return response.json<AuthResponse>();
}

function bearer(token: string) {
  return { authorization: `Bearer ${token}` };
}

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

describe("authentication and cart ownership regressions", () => {
  it("rejects missing and malformed JWTs without an environment opt-in", async () => {
    const app = await buildApp();

    const missing = await app.inject({ method: "GET", url: "/cart" });
    expect(missing.statusCode).toBe(401);
    expect(missing.json()).toEqual({ error: "Unauthorized" });

    const malformed = await app.inject({
      method: "GET",
      url: "/cart",
      headers: bearer("not-a-jwt"),
    });
    expect(malformed.statusCode).toBe(401);
    expect(malformed.json()).toEqual({ error: "Unauthorized" });
  });

  it("prevents cross-user cart deletion without revealing item existence", async () => {
    const app = await buildApp({ preverify: true });
    const owner = await registerUser(app, "owner");
    const attacker = await registerUser(app, "attacker");

    const added = await app.inject({
      method: "POST",
      url: "/cart",
      headers: bearer(owner.token),
      payload: { personaId: "p-001", quantity: 1 },
    });
    expect(added.statusCode).toBe(200);
    const itemId = added.json<Cart>().items[0]?.id;
    expect(itemId).toBeTruthy();

    const forbidden = await app.inject({
      method: "DELETE",
      url: `/cart/${itemId}`,
      headers: bearer(attacker.token),
    });
    expect(forbidden.statusCode).toBe(404);
    expect(forbidden.json()).toEqual({ error: "Cart item not found" });

    const missing = await app.inject({
      method: "DELETE",
      url: "/cart/cart-does-not-exist",
      headers: bearer(attacker.token),
    });
    expect(missing.statusCode).toBe(404);
    expect(missing.json()).toEqual(forbidden.json());

    const ownerCart = await app.inject({
      method: "GET",
      url: "/cart",
      headers: bearer(owner.token),
    });
    expect(ownerCart.statusCode).toBe(200);
    expect(ownerCart.json<Cart>().items.map((item) => item.id)).toContain(itemId);

    const ownerDelete = await app.inject({
      method: "DELETE",
      url: `/cart/${itemId}`,
      headers: bearer(owner.token),
    });
    expect(ownerDelete.statusCode).toBe(200);
    expect(ownerDelete.json<Cart>().items).toHaveLength(0);
  });
});
