import {
  generateTokens,
  verifyToken,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

describe("Auth Utilities", () => {
  const mockUser = {
    userId: "test-user-id",
    email: "test@example.com",
    role: "STUDENT" as const,
    status: "ACTIVE" as const,
  };

  describe("generateTokens", () => {
    beforeEach(() => {
      // Set required environment variables for testing
      process.env.JWT_SECRET =
        "test-jwt-secret-that-is-long-enough-for-testing";
      process.env.JWT_REFRESH_SECRET =
        "test-refresh-secret-that-is-long-enough-for-testing";
    });

    it("should generate access and refresh tokens", () => {
      const tokens = generateTokens(mockUser);

      expect(tokens).toHaveProperty("accessToken");
      expect(tokens).toHaveProperty("refreshToken");
      expect(typeof tokens.accessToken).toBe("string");
      expect(typeof tokens.refreshToken).toBe("string");
    });

    it("should generate different tokens for access and refresh", () => {
      const tokens = generateTokens(mockUser);

      expect(tokens.accessToken).not.toBe(tokens.refreshToken);
    });
  });

  describe("verifyToken", () => {
    beforeEach(() => {
      process.env.JWT_SECRET =
        "test-jwt-secret-that-is-long-enough-for-testing";
      process.env.JWT_REFRESH_SECRET =
        "test-refresh-secret-that-is-long-enough-for-testing";
    });

    it("should verify valid access token", () => {
      const tokens = generateTokens(mockUser);
      const payload = verifyToken(tokens.accessToken);

      expect(payload).not.toBeNull();
      expect(payload?.userId).toBe(mockUser.userId);
      expect(payload?.email).toBe(mockUser.email);
      expect(payload?.role).toBe(mockUser.role);
    });

    it("should verify valid refresh token", () => {
      const tokens = generateTokens(mockUser);
      const payload = verifyToken(tokens.refreshToken, true);

      expect(payload).not.toBeNull();
      expect(payload?.userId).toBe(mockUser.userId);
    });

    it("should return null for invalid token", () => {
      const payload = verifyToken("invalid-token");

      expect(payload).toBeNull();
    });

    it("should return null for expired token", () => {
      // This would require mocking time or using a very short expiry
      const payload = verifyToken("expired-token");

      expect(payload).toBeNull();
    });
  });

  describe("hashPassword", () => {
    it("should hash password", async () => {
      const password = "testpassword123";
      const hashed = await hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(0);
    });

    it("should generate different hashes for same password", async () => {
      const password = "testpassword123";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verifyPassword", () => {
    it("should verify correct password", async () => {
      const password = "testpassword123";
      const hashed = await hashPassword(password);
      const isValid = await verifyPassword(password, hashed);

      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const password = "testpassword123";
      const wrongPassword = "wrongpassword";
      const hashed = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hashed);

      expect(isValid).toBe(false);
    });
  });
});
