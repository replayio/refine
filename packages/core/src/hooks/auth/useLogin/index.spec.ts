import { renderHook, waitFor } from "@testing-library/react";
import ReactRouterDom from "react-router-dom";

import { TestWrapper } from "@test";

import { useLogin } from "./";
import { act } from "react-dom/test-utils";

const mHistory = jest.fn();

jest.mock("react-router-dom", () => ({
    ...(jest.requireActual("react-router-dom") as typeof ReactRouterDom),
    useNavigate: () => mHistory,
}));

describe("useLogin Hook", () => {
    beforeEach(() => {
        mHistory.mockReset();
        jest.spyOn(console, "error").mockImplementation((message) => {
            if (message?.message === "Wrong username") return;
            if (typeof message === "undefined") return;
            console.warn(message);
        });
    });

    it("succeed login", async () => {
        const { result } = renderHook(() => useLogin(), {
            wrapper: TestWrapper({
                authProvider: {
                    login: ({ username }) => {
                        if (username === "test") {
                            return Promise.resolve();
                        }

                        return Promise.reject(new Error("Wrong username"));
                    },
                    checkAuth: () => Promise.resolve(),
                    checkError: () => Promise.resolve(),
                    getPermissions: () => Promise.resolve(),
                    logout: () => Promise.resolve(),
                    getUserIdentity: () => Promise.resolve({ id: 1 }),
                },
            }),
        });

        const { mutate: login } = result.current ?? { mutate: () => 0 };

        await act(async () => {
            await login({ username: "test" });
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBeTruthy();
        });

        expect(mHistory).toBeCalledWith("/", { replace: true });
    });

    it("should successfully login with no redirect", async () => {
        const { result } = renderHook(() => useLogin(), {
            wrapper: TestWrapper({
                authProvider: {
                    login: ({ username }) => {
                        if (username === "test") {
                            return Promise.resolve(false);
                        }

                        return Promise.reject(new Error("Wrong username"));
                    },
                    checkAuth: () => Promise.resolve(),
                    checkError: () => Promise.resolve(),
                    getPermissions: () => Promise.resolve(),
                    logout: () => Promise.resolve(),
                    getUserIdentity: () => Promise.resolve({ id: 1 }),
                },
            }),
        });

        const { mutate: login } = result.current ?? { mutate: () => 0 };

        await act(async () => {
            await login({ username: "test" });
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBeTruthy();
        });

        expect(mHistory).not.toBeCalled();
    });

    it("login and redirect to custom path", async () => {
        const { result } = renderHook(() => useLogin(), {
            wrapper: TestWrapper({
                authProvider: {
                    login: ({ username, redirectPath }) => {
                        if (username === "test") {
                            return Promise.resolve(redirectPath);
                        }

                        return Promise.reject(new Error("Wrong username"));
                    },
                    checkAuth: () => Promise.resolve(),
                    checkError: () => Promise.resolve(),
                    getPermissions: () => Promise.resolve(),
                    logout: () => Promise.resolve(),
                    getUserIdentity: () => Promise.resolve({ id: 1 }),
                },
            }),
        });

        const { mutate: login } = result.current ?? { mutate: () => 0 };

        await act(async () => {
            await login({ username: "test", redirectPath: "/custom-path" });
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBeTruthy();
        });

        expect(mHistory).toBeCalledWith("/custom-path", { replace: true });
    });

    it("If URL has 'to' params the app will redirect to 'to' values", async () => {
        const { result } = renderHook(() => useLogin(), {
            wrapper: TestWrapper({
                authProvider: {
                    login: ({ username, redirectPath }) => {
                        if (username === "test") {
                            return Promise.resolve(redirectPath);
                        }

                        return Promise.reject(new Error("Wrong username"));
                    },
                    checkAuth: () => Promise.resolve(),
                    checkError: () => Promise.resolve(),
                    getPermissions: () => Promise.resolve(),
                    logout: () => Promise.resolve(),
                    getUserIdentity: () => Promise.resolve({ id: 1 }),
                },
                routerInitialEntries: ["?to=/show/posts/5"],
            }),
        });

        const { mutate: login } = result.current ?? { mutate: () => 0 };

        await act(async () => {
            await login({ username: "test", redirectPath: "/custom-path" });
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBeTruthy();
        });

        expect(mHistory).toBeCalledWith("/show/posts/5", { replace: true });
    });

    it("fail login", async () => {
        const { result } = renderHook(() => useLogin(), {
            wrapper: TestWrapper({
                authProvider: {
                    login: () => Promise.reject(new Error("Wrong username")),
                    checkAuth: () => Promise.resolve(),
                    checkError: () => Promise.resolve(),
                    getPermissions: () => Promise.resolve(),
                    logout: () => Promise.resolve(),
                    getUserIdentity: () => Promise.resolve({ id: 1 }),
                },
            }),
        });

        const { mutate: login } = result.current ?? { mutate: () => 0 };

        await act(async () => {
            await login({ username: "demo" });
        });

        await waitFor(() => {
            expect(result.current.isError).toBeTruthy();
        });

        const { error } = result.current ?? { error: undefined };

        expect(error).toEqual(new Error("Wrong username"));
    });

    it("login rejected with undefined error", async () => {
        const { result } = renderHook(() => useLogin(), {
            wrapper: TestWrapper({
                authProvider: {
                    login: () => Promise.reject(),
                    checkAuth: () => Promise.resolve(),
                    checkError: () => Promise.resolve(),
                    getPermissions: () => Promise.resolve(),
                    logout: () => Promise.resolve(),
                    getUserIdentity: () => Promise.resolve({ id: 1 }),
                },
            }),
        });

        const { mutate: login } = result.current ?? { mutate: () => 0 };

        await act(async () => {
            await login({ username: "demo" });
        });

        await waitFor(() => {
            expect(result.current.isError).toBeTruthy();
        });

        const { error } = result.current ?? { error: undefined };

        expect(error).not.toBeDefined();
    });
});
