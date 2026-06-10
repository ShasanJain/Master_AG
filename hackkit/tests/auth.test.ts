// tests/auth.test.ts
// Tests for auth helpers — mocks Firebase so no real API calls

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  updateProfile: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => true, data: () => ({ role: "user" }) })),
  serverTimestamp: jest.fn(() => new Date()),
}));

jest.mock("@/lib/firebase", () => ({
  auth: {},
  db: {},
  storage: {},
}));

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

const mockSignIn = signInWithEmailAndPassword as jest.Mock;
const mockRegister = createUserWithEmailAndPassword as jest.Mock;

describe("Auth: loginUser", () => {
  it("calls signInWithEmailAndPassword with correct args", async () => {
    mockSignIn.mockResolvedValueOnce({ user: { uid: "123" } });
    const { loginUser } = await import("@/lib/auth");
    await loginUser("test@example.com", "password123");
    expect(mockSignIn).toHaveBeenCalledWith(
      expect.anything(),
      "test@example.com",
      "password123"
    );
  });

  it("throws when credentials are invalid", async () => {
    mockSignIn.mockRejectedValueOnce(new Error("invalid-credential"));
    const { loginUser } = await import("@/lib/auth");
    await expect(loginUser("bad@example.com", "wrong")).rejects.toThrow();
  });
});

describe("Auth: registerUser", () => {
  it("calls createUserWithEmailAndPassword", async () => {
    const { updateProfile } = await import("firebase/auth");
    const { setDoc } = await import("firebase/firestore");
    mockRegister.mockResolvedValueOnce({
      user: { uid: "abc", email: "new@example.com", displayName: null },
    });
    (updateProfile as jest.Mock).mockResolvedValueOnce(undefined);
    (setDoc as jest.Mock).mockResolvedValueOnce(undefined);

    const { registerUser } = await import("@/lib/auth");
    const result = await registerUser("new@example.com", "password123", "Jane", "user");
    expect(result.email).toBe("new@example.com");
    expect(result.role).toBe("user");
  });
});
