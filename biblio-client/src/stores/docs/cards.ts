import { StoreCore, createStore, mixStores } from "@priolo/jon"
import { cardsSetup, CardsState, CardsStore } from "@priolo/jack"



export const deckCardsSo = createStore(cardsSetup) as CardsStore

const setupDrawer = {
	state: {
		width: 0,
		/** indica che deve attivare l'animazione */
		animation: false,
		/** l'ultimo gap prima di chiuderlo */
		lastWidth: 500,
	},
	mutators: {
		setWidth: (width: number) => ({ width }),
	},
}
export type DrawerState = typeof setupDrawer.state & CardsState
type DrawerMutators = typeof setupDrawer.mutators
export interface DrawerStore extends CardsStore, StoreCore<DrawerState>, DrawerMutators { state: DrawerState }

export const drawerCardsSo = createStore(mixStores(cardsSetup, setupDrawer)) as DrawerStore

export const GetAllCards = () => [...deckCardsSo.state.all, ...drawerCardsSo.state.all]