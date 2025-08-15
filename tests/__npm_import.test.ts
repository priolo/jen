import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';



describe("TEST SERVICE", () => {

	beforeAll(async () => {
	})

	test("su creazione", async () => {

		const className = 'Service'; // Replace with the actual class name you want to load
		const packageName = 'julian-node-test';
		const YourClass = await loadClassFromPackage(packageName, className);
		const instance = new YourClass();
		console.log(instance);



		// const root:RootService = await RootService.Start(
		// 	<conf>{ class: TestService, name: "npm:julian-node-test" }
		// )
		// const testService = PathFinder.Get<TestService>(root, "/test")

		// testService.setState({ value2: 10 })
		// expect(testService.state.value2).toBe(10)

		// testService.execute( { type: Actions.TEST_SET, payload: "topolino" } )
		// expect(testService.state.value1).toBe("topolino")

		// testService.execute( { type: Actions.TEST_INCREMENT, payload: 10 } )
		// expect(testService.state.value2).toBe(20)

		// await RootService.Stop(root)
	})

})


async function loadClassFromPackage(packageName: string, className: string) {
	try {
		const packagePath = getNodeModulesPath(packageName);
		const module = await import(packagePath);
		if (module[className]) {
			return module[className];
		} else {
			throw new Error(`Class ${className} not found in package ${packageName}`);
		}
	} catch (error) {
		console.error(`Error loading class ${className} from package ${packageName}:`, error);
		throw error;
	}
}

// Function to get the path to the node_modules directory
function getNodeModulesPath(packageName:string): string {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);
	return path.resolve(__dirname, '../../node_modules', packageName);
  }