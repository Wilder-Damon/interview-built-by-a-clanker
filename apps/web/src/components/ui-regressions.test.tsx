import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { AuthResponse, CartItem as CartItemType, Persona } from "@acme/shared";
import { PersonaCard } from "./PersonaCard";
import { CartItem } from "./CartItem";
import { AuthProvider, useAuth } from "~/lib/auth";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="#">{children}</a>,
}));

vi.mock("~/lib/api", () => ({
  api: { get: vi.fn(() => new Promise(() => {})) },
  ApiError: class ApiError extends Error {},
}));

const persona: Persona = {
  id: "p-test",
  name: "Test Persona",
  tagline: "Tests UI contracts",
  description: "A deterministic persona fixture.",
  avatarUrl: "/avatar.svg",
  specialty: "Engineering",
  capabilities: ["Testing"],
  price: 49.99,
  rating: 4.5,
  reviewCount: 10,
  tier: "Pro",
};

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("UI regressions", () => {
  it("displays the stored monthly persona price", () => {
    render(<PersonaCard persona={persona} />);

    expect(screen.getByText(/\$49\.99/)).toBeTruthy();
  });

  it("does not submit a cart quantity below one", () => {
    const item: CartItemType = {
      id: "cart-1",
      personaId: persona.id,
      persona,
      quantity: 1,
    };
    const onUpdateQuantity = vi.fn();

    render(
      <CartItem
        item={item}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={vi.fn()}
      />,
    );

    const decrement = screen.getByRole("button", { name: "-" });
    expect((decrement as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(decrement);
    expect(onUpdateQuantity).not.toHaveBeenCalled();
  });

  it("removes the persisted token on logout", () => {
    const response: AuthResponse = {
      token: "test-token",
      user: {
        id: "user-1",
        username: "tester",
        email: "tester@example.com",
      },
    };

    function Harness() {
      const { login, logout } = useAuth();
      return (
        <>
          <button onClick={() => login(response)}>Log in</button>
          <button onClick={logout}>Log out</button>
        </>
      );
    }

    render(
      <AuthProvider>
        <Harness />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Log in" }));
    expect(localStorage.getItem("auth_token")).toBe("test-token");

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));
    expect(localStorage.getItem("auth_token")).toBeNull();
  });
});
