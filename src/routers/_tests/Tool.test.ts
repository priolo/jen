import { RootService } from "@priolo/julian";
import buildNodeConfig, { PORT } from "../../config";
import axios, { AxiosInstance } from "axios";

describe("Test on TOOL router", () => {
	let axiosIstance: AxiosInstance;
	let root: RootService;

	beforeAll(async () => {
		axiosIstance = axios.create({
			baseURL: `http://localhost:${PORT}`,
			withCredentials: true,
		});

		const cnf = buildNodeConfig();
		root = await RootService.Start(cnf);
	});

	afterAll(async () => {
		await RootService.Stop(root);
	});

	test("posso accedere all'endpoint?", async () => {
		// creo un tool nuovo
		const tool1Payload = {
			name: "name",
			description: "description",
			inputSchema: JSON.stringify({ param1: "value1" }),
			code: "console.log('hello');",
		};
		const tool1 = await axiosIstance.post(`/api/tools`, { tool: tool1Payload });
		expect(tool1.status).toBe(200);
		expect(tool1.data).toHaveProperty("id");

		// creo un altro tool
		const tool2Payload = {
			name: "name2",
			description: "description2",
			inputSchema: JSON.stringify({ param2: "value2" }),
			code: "console.log('world');",
		};
		const tool2 = await axiosIstance.post(`/api/tools`, { tool: tool2Payload });
		expect(tool2.status).toBe(200);
		expect(tool2.data).toHaveProperty("id");

		// recupero i tool
		const allTools = await axiosIstance.get(`/api/tools`);
		expect(allTools.status).toBe(200);
		expect(allTools.data?.length).toBe(2);

		// recupero un tool
		const tool1_ = await axiosIstance.get(`/api/tools/${tool1.data.id}`);
		expect(tool1_.status).toBe(200);
		expect(tool1_.data).toHaveProperty("id");

		// aggiorno il tool
		const toolUpdatePayload = {
			name: "name3",
			description: "description3",
		};
		const toolUpdate = await axiosIstance.patch(
			`/api/tools/${tool1.data.id}`,
			{ tool: toolUpdatePayload }
		);
		expect(toolUpdate.status).toBe(200);
		expect(toolUpdate.data.name).toBe("name3");
		expect(toolUpdate.data.description).toBe("description3");


		// cancello il tool
		const toolDelete = await axiosIstance.delete(`/api/tools/${tool1.data.id}`);
		expect(toolDelete.status).toBe(200);

		// cancello il secondo tool per pulizia
		const tool2Delete = await axiosIstance.delete(`/api/tools/${tool2.data.id}`);
		expect(tool2Delete.status).toBe(200);

	});
});
