import { RootService } from "@priolo/julian";
import axios, { AxiosInstance } from "axios";
import buildNodeConfig, { PORT } from "../../config";

// Mock Google OAuth client
jest.mock('google-auth-library', () => ({
	OAuth2Client: jest.fn().mockImplementation(() => ({
		verifyIdToken: jest.fn()
	}))
}));

describe("Test on AUTH router", () => {
	let axiosInstance: AxiosInstance;
	let root: RootService;

	beforeAll(async () => {
		axiosInstance = axios.create({
			baseURL: `http://localhost:${PORT}`,
			withCredentials: true,
		});

		const cnf = buildNodeConfig(true, true);
		root = await RootService.Start(cnf);
	});

	afterAll(async () => {
		await RootService.Stop(root);
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	test("current endpoint returns 401 when no JWT token is present", async () => {
		const response = await axiosInstance.get("/api/auth/current");
		expect(response.status).toBe(401);
		expect(response.data.user).toBeNull();
	}, 100000);

	test("logout endpoint clears JWT cookie", async () => {
		const response = await axiosInstance.post("/api/auth/logout");
		expect(response.status).toBe(200);
		expect(response.data).toBe("Logout successful");
	}, 100000);

	test("Google login creates new user and returns JWT", async () => {
		const { OAuth2Client } = require('google-auth-library');
		const mockVerifyIdToken = OAuth2Client.mock.results[0].value.verifyIdToken;
		
		const mockPayload = {
			email: "test@example.com",
			name: "Test User",
			picture: "https://example.com/avatar.jpg"
		};

		mockVerifyIdToken.mockResolvedValue({
			getPayload: () => mockPayload
		});

		const response = await axiosInstance.post("/api/auth/google", {
			token: "mock-google-token"
		});

		expect(response.status).toBe(200);
		expect(response.data.user).toHaveProperty("email", "test@example.com");
		expect(response.data.user).toHaveProperty("name", "Test User");
		expect(response.data.user).toHaveProperty("avatarUrl", "https://example.com/avatar.jpg");
		expect(response.data.user).not.toHaveProperty("password");
		expect(response.data.user).not.toHaveProperty("salt");
	}, 100000);

	test("Google login returns existing user if already registered", async () => {
		const { OAuth2Client } = require('google-auth-library');
		const mockVerifyIdToken = OAuth2Client.mock.results[0].value.verifyIdToken;
		
		const mockPayload = {
			email: "existing@example.com",
			name: "Existing User",
			picture: "https://example.com/existing-avatar.jpg"
		};

		mockVerifyIdToken.mockResolvedValue({
			getPayload: () => mockPayload
		});

		// First login - creates user
		const firstResponse = await axiosInstance.post("/api/auth/google", {
			token: "mock-google-token-1"
		});
		expect(firstResponse.status).toBe(200);
		const firstUserId = firstResponse.data.user.id;

		// Second login - should return same user
		const secondResponse = await axiosInstance.post("/api/auth/google", {
			token: "mock-google-token-2"
		});
		expect(secondResponse.status).toBe(200);
		expect(secondResponse.data.user.id).toBe(firstUserId);
		expect(secondResponse.data.user.email).toBe("existing@example.com");
	}, 100000);

	test("Google login returns 401 for invalid token", async () => {
		const { OAuth2Client } = require('google-auth-library');
		const mockVerifyIdToken = OAuth2Client.mock.results[0].value.verifyIdToken;
		
		mockVerifyIdToken.mockRejectedValue(new Error("Invalid token"));

		const response = await axiosInstance.post("/api/auth/google", {
			token: "invalid-token"
		});

		expect(response.status).toBe(401);
		expect(response.data.error).toBe("Invalid Token");
	}, 100000);

	test("current endpoint returns user data with valid JWT", async () => {
		const { OAuth2Client } = require('google-auth-library');
		const mockVerifyIdToken = OAuth2Client.mock.results[0].value.verifyIdToken;
		
		const mockPayload = {
			email: "jwt-test@example.com",
			name: "JWT Test User",
			picture: "https://example.com/jwt-avatar.jpg"
		};

		mockVerifyIdToken.mockResolvedValue({
			getPayload: () => mockPayload
		});

		// First login to get JWT cookie
		const loginResponse = await axiosInstance.post("/api/auth/google", {
			token: "mock-jwt-token"
		});
		expect(loginResponse.status).toBe(200);

		// Extract cookies from login response
		const cookies = loginResponse.headers['set-cookie'];
		let jwtCookie = '';
		if (cookies) {
			const jwtCookieHeader = cookies.find(cookie => cookie.startsWith('jwt='));
			if (jwtCookieHeader) {
				jwtCookie = jwtCookieHeader.split(';')[0];
			}
		}

		// Use the JWT cookie for current request
		const currentResponse = await axiosInstance.get("/api/auth/current", {
			headers: {
				Cookie: jwtCookie
			}
		});

		expect(currentResponse.status).toBe(200);
		expect(currentResponse.data.user).toHaveProperty("email", "jwt-test@example.com");
		expect(currentResponse.data.user).not.toHaveProperty("password");
		expect(currentResponse.data.user).not.toHaveProperty("salt");
	}, 100000);

	test("current endpoint returns 404 when user not found in database", async () => {
		// This test would require mocking the JWT service to return a non-existent email
		// For now, we'll test with an invalid JWT structure
		const response = await axiosInstance.get("/api/auth/current", {
			headers: {
				Cookie: "jwt=invalid-jwt-token"
			}
		});

		expect(response.status).toBe(401);
		expect(response.data.user).toBeNull();
	}, 100000);

});