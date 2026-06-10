// tests/storage.test.ts
// Mock Firebase so no real SDK initialization happens
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  getApp: jest.fn(),
}));
jest.mock("firebase/auth", () => ({ getAuth: jest.fn() }));
jest.mock("firebase/firestore", () => ({ getFirestore: jest.fn() }));
jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytesResumable: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn(),
}));
jest.mock("@/lib/firebase", () => ({ auth: {}, db: {}, storage: {} }));

import { isAllowedType, ALLOWED_TYPES } from "@/lib/storage";

describe("Storage: isAllowedType", () => {
  it("allows PDF files", () => {
    const file = new File([""], "doc.pdf", { type: "application/pdf" });
    expect(isAllowedType(file)).toBe(true);
  });

  it("allows JPEG images", () => {
    const file = new File([""], "photo.jpg", { type: "image/jpeg" });
    expect(isAllowedType(file)).toBe(true);
  });

  it("allows PNG images", () => {
    const file = new File([""], "photo.png", { type: "image/png" });
    expect(isAllowedType(file)).toBe(true);
  });

  it("allows WebP images", () => {
    const file = new File([""], "photo.webp", { type: "image/webp" });
    expect(isAllowedType(file)).toBe(true);
  });

  it("allows plain text files", () => {
    const file = new File([""], "notes.txt", { type: "text/plain" });
    expect(isAllowedType(file)).toBe(true);
  });

  it("rejects executable files", () => {
    const file = new File([""], "virus.exe", { type: "application/octet-stream" });
    expect(isAllowedType(file)).toBe(false);
  });

  it("rejects HTML files", () => {
    const file = new File([""], "hack.html", { type: "text/html" });
    expect(isAllowedType(file)).toBe(false);
  });

  it("rejects ZIP archives", () => {
    const file = new File([""], "archive.zip", { type: "application/zip" });
    expect(isAllowedType(file)).toBe(false);
  });

  it("ALLOWED_TYPES includes expected formats", () => {
    expect(ALLOWED_TYPES).toContain("application/pdf");
    expect(ALLOWED_TYPES).toContain("image/jpeg");
    expect(ALLOWED_TYPES).toContain("image/png");
    expect(ALLOWED_TYPES).toContain("image/webp");
    expect(ALLOWED_TYPES).toContain("text/plain");
  });
});
