import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import type { Persona, User } from "@acme/shared";

const state = vi.hoisted(() => ({
  search: {} as Record<string, unknown>,
  user: null as User | null,
  queryOptions: [] as Array<Record<string, unknown>>,
  mutationOptions: [] as Array<Record<string, unknown>>,
  post: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => {
  const makeRoute = () => (options: Record<string, unknown>) => ({
    options,
    useParams: () => ({ personaId: "p-test" }),
    useSearch: () => state.search,
  });

  return {
    createFileRoute: makeRoute,
    createRootRoute: (options: Record<string, unknown>) => ({ options }),
    Link: ({ children }: { children: ReactNode }) => <a href="#">{children}</a>,
    Outlet: () => null,
    useNavigate: () => vi.fn(),
    useRouter: () => ({ navigate: vi.fn() }),
  };
});

vi.mock("@tanstack/react-query", () => ({
  useQuery: (options: Record<string, unknown>) => {
    state.queryOptions.push(options);
    const key = options.queryKey as unknown[];
    if (key[0] === "persona") {
      return { data: persona, isLoading: false };
    }
    if (key[0] === "favorites") {
      return { data: [], isLoading: false };
    }
    if (key[0] === "cart" || key[0] === "cart-count") {
      return { data: { items: [], total: 0 }, isLoading: false };
    }
    return { data: [], isLoading: false };
  },
  useMutation: (options: Record<string, unknown>) => {
    state.mutationOptions.push(options);
    return { mutate: vi.fn(), isPending: false, error: null };
  },
}));

vi.mock("~/lib/auth", () => ({
  useAuth: () => ({ user: state.user, logout: vi.fn() }),
}));

vi.mock("~/lib/api", () => ({
  api: {
    delete: state.remove,
    get: vi.fn(),
    post: state.post,
    put: vi.fn(),
  },
}));

vi.mock("~/lib/queryClient", () => ({
  queryClient: { invalidateQueries: vi.fn() },
}));

vi.mock("~/components/FilterPanel", () => ({ FilterPanel: () => null }));
vi.mock("~/components/PersonaCard", () => ({ PersonaCard: () => null }));
vi.mock("~/components/SearchBar", () => ({ SearchBar: () => null }));

import { Route as BrowseRoute } from "./index";
import { Route as PersonaRoute } from "./personas/$personaId";
import { Route as CartRoute } from "./cart";
import { Route as CheckoutRoute } from "./checkout";
import { Route as FavoritesRoute } from "./favorites";
import { Route as RootRoute } from "./__root";

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

function renderRoute(route: { options: { component: () => ReactNode } }) {
  const Component = route.options.component;
  return render(<Component />);
}

beforeEach(() => {
  state.search = {};
  state.user = { id: "user-1", username: "tester", email: "tester@example.com" };
  state.queryOptions.length = 0;
  state.mutationOptions.length = 0;
});

afterEach(() => cleanup());

describe("route query and mutation contracts", () => {
  it("includes effective browse filters in the persona query key", () => {
    state.search = { q: "rex", tier: "Pro" };

    renderRoute(BrowseRoute as never);

    expect(state.queryOptions[0]?.queryKey).toEqual([
      "personas",
      "q=rex&tier=Pro",
    ]);
  });

  it("adds an absent favorite instead of deleting it", async () => {
    renderRoute(PersonaRoute as never);

    const toggle = state.mutationOptions[1]?.mutationFn as () => Promise<unknown>;
    await toggle();

    expect(state.post).toHaveBeenCalledWith("/favorites", {
      personaId: "p-test",
    });
    expect(state.remove).not.toHaveBeenCalled();
  });

  it("does not query favorites for an anonymous visitor", () => {
    state.user = null;

    renderRoute(PersonaRoute as never);

    const favorites = state.queryOptions.find(
      (options) => (options.queryKey as unknown[])[0] === "favorites",
    );
    expect(favorites?.enabled).toBe(false);
  });

  it("uses the same user-scoped favorites key on detail and list pages", () => {
    renderRoute(PersonaRoute as never);
    const detailKey = state.queryOptions.find(
      (options) => (options.queryKey as unknown[])[0] === "favorites",
    )?.queryKey;

    state.queryOptions.length = 0;
    renderRoute(FavoritesRoute as never);
    const listKey = state.queryOptions[0]?.queryKey;

    expect(detailKey).toEqual(["favorites", "user-1"]);
    expect(listKey).toEqual(detailKey);
  });

  it("uses the same user-scoped cart query key in navigation, cart, and checkout", () => {
    renderRoute(RootRoute as never);
    const rootKey = state.queryOptions[0]?.queryKey;

    state.queryOptions.length = 0;
    renderRoute(CartRoute as never);
    const cartKey = state.queryOptions[0]?.queryKey;

    state.queryOptions.length = 0;
    renderRoute(CheckoutRoute as never);
    const checkoutKey = state.queryOptions[0]?.queryKey;

    expect(rootKey).toEqual(["cart", "user-1"]);
    expect(cartKey).toEqual(rootKey);
    expect(checkoutKey).toEqual(rootKey);
  });
});
