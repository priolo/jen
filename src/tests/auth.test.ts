import { email, PathFinder, RootService, service, typeorm } from "typexpress"
import buildNodeConfig from "../config"
import { ajax } from "./utils/ajax"
import { OAuth2Client } from 'google-auth-library';

// Mock the OAuth2Client
jest.mock('google-auth-library', () => {
  const mOAuth2Client = {
    verifyIdToken: jest.fn().mockResolvedValue({
      getPayload: () => ({
        email: 'testuser@gmail.com',
        name: 'Test User',
      }),
    }),
  };
  return { OAuth2Client: jest.fn(() => mOAuth2Client) };
});

let root

beforeAll(async () => {
	const cnf = buildNodeConfig()
	root = await RootService.Start(cnf)
})

afterAll(async () => {
	await RootService.Stop(root)
})

test("register with email", async () => {

	const email = "test@test.com"
	const password = "123"

	const emailService = new PathFinder(root).getNode<email.Service>("/email")
	emailService.emitter.once ( service.ServiceBaseEvents.DISPATCH, (action)=> {
	})

	// mi registro
	let response = await ajax.post( `/auth/register`, { email } )
	expect(response.status).toBe(200)

	// ricavo il codice di registrazione dal db
	const userRepo = new PathFinder(root).getNode<typeorm.repo>("/typeorm/users")
	const [user] = await userRepo.dispatch({
		type: typeorm.Actions.FIND,
		payload: { where: { email } }
	})
	expect(user.salt).not.toBeNull()

	// attivo l'account
	response = await ajax.post( `/auth/activate`, { code: user.salt, password } )
	expect(response.status).toBe(200)
	expect(response.data.data).toBe('activate:ok')
	
	// eseguo il login
	response = await ajax.post( `/auth/login`, { email, password } )
	expect(response.status).toBe(200)
	expect(response.data.token).not.toBeNull()

})

test("login with google", async () => {
  const token = "test-google-oauth-token";

  // Make a request to the Google login route
  const response = await ajax.post(`/auth/google`, { token });
  expect(response.status).toBe(200);
  expect(response.data.user.email).toBe("testuser@gmail.com");

  // Verify that the user is saved in the database
  const userRepo = new PathFinder(root).getNode<typeorm.repo>("/typeorm/users");
  const [user] = await userRepo.dispatch({
    type: typeorm.Actions.FIND,
    payload: { where: { email: "testuser@gmail.com" } }
  });
  expect(user).not.toBeNull();
  expect(user.email).toBe("testuser@gmail.com");
});

