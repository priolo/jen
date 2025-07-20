import { ViewStore } from "@/stores/stacks/viewBase";

const dbName = 'biblio';
const storeName = 'cards';
let dbInstance: IDBDatabase | null = null;
enum SyncStatus {
    SYNCED = "synced",
    NOT_SYNCED = "not_synced"
}

interface MyData {
    data: any;  // You can replace 'any' with a specific type if you know the structure of your JSON.
    sync: SyncStatus;
}

function openDatabase(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		if (dbInstance) {
			resolve(dbInstance);
			return;
		}

		const request = indexedDB.open(dbName, 1);

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains(storeName)) {
				const store = db.createObjectStore(storeName);
				store.createIndex('sync', 'sync', { unique: false });
			}
		};
		request.onsuccess = () => {
			dbInstance = request.result;
			resolve(dbInstance);
		};
		request.onerror = () => {
			reject(request.error);
		};
	});
}


async function IdbLoad(id: string | number): Promise<any> {
	const db = await openDatabase();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction([storeName], 'readonly');
		const objectStore = transaction.objectStore(storeName);
		//const request = objectStore.getAll();
		const request = objectStore.get(id);
		request.onsuccess = () => resolve(request.result)
		request.onerror = () => reject(request.error)
	});
}
export async function IdbLoadData(id: string): Promise<any> {
	try {
		const data = await IdbLoad(id)
		console.log('Elemento caricato con successo');
		return data
	} catch (error) {
		console.error('Errore nel caricamento dell\'elemento:', error);
	}
}



async function IdbSaveOrUpdate(id: string, data: MyData): Promise<void> {
	const db = await openDatabase();
	return new Promise(async (resolve, reject) => {

		const exists = await IdbLoadData(id) !== undefined;
		const transaction = db.transaction([storeName], 'readwrite');
		const objectStore = transaction.objectStore(storeName);
		const request = exists ? objectStore.put(data, id) : objectStore.add(data, id);
		request.onsuccess = () => resolve()
		request.onerror = () => reject(request.error)

	})
}
export async function IdbSaveOrUpdateData(id: string, data: MyData): Promise<void> {
	try {
		await IdbSaveOrUpdate(id, data)
	} catch (error) {
		console.error('Errore nel salvataggio o aggiornamento dell\'elemento:', error);
	}
}


function getRecordsBySyncStatus(db: IDBDatabase, syncStatus: SyncStatus): Promise<MyData[]> {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('myStore', 'readonly');
        const store = transaction.objectStore('myStore');
        const index = store.index('sync');
        const request = index.getAll(syncStatus);
        request.onsuccess = (event) => resolve((event.target as IDBRequest).result)
        request.onerror = (event) => reject((event.target as IDBRequest).error)
    });
}