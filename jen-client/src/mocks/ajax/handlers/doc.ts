// src/mocks/handlers.js
import { http, HttpResponse } from 'msw'



export const doc = [
	http.get('/api/doc/:id', async ({ params, request }) => {
		const { id } = params
		
		return HttpResponse.json(
			{ data: body },
			{ status: 200 }
		)
	}),
	http.post('/api/doc/:id', async ({ params, request }) => {
		const { id } = params
		const body = await request.json()

		// Qui puoi aggiungere la logica per gestire la richiesta
		// Per esempio, puoi simulare una risposta di successo:
		return HttpResponse.json(
			{ message: `Documento ${id} aggiornato con successo`, data: body },
			{ status: 200 }
		)
	}),
]
