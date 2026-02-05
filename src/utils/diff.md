scrivi due funzioni:
getDiff: che accetta due oggetti json A e B e restituisce un oggetto di differenze "diff"
applyDiff: che accetta un oggetto json A e un oggetto di differenze "diff" e restituisce l'oggetto B

le "diff" devono tener conto anche degli array. in praticolar modo che c'e' la proprietà "id" deve poter capire quele azione fare all'array senza dover sostituire tutto l'array

per esempio:

```ts
const a = {
	"name": "Alice",
	"age": 30,
	"friends": [
		{"id": "fr-1", "name": "Maria"},
		{"id": "fr-2", "name": "Federico"}
	],
	"tags": [
		{ "tag": "friend"},
		{ "tag": "colleague"}
	],
}

const b = {
	"name": "Alice",
	"age": 31,
	"friends": [
		{"id": "fr-1", "name": "Mario"},
		{"id": "fr-3", "name": "Giuseppe"}
	],
	"tags": [
		{ "tag": "best friend"},
		{ "tag": "family"}
	],

}

const diff = getDiff(a, b);
// diff dovrebbe essere:

[
	{ "path": "/age", "value": 31 },
	{ "path": "/friends/{id:fr-1}", "value": "Mario" }, 
	{ "path": "/friends/{id:fr-2}", "op": "delete" },
	{ "path": "/friends/{id:fr-3}", "value": "Giuseppe" },
	{ "path": "/tags", "value": [
		{ "tag": "best friend"},
		{ "tag": "family"}
	]},
]

```

Suggerisci soluzioni architettoniche migliori o piu' performanti se ne conosci.
