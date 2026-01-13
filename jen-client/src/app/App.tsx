import MainMenu from "@/app/mainMenu/MainMenu"
import docsSo from "@/stores/docs"
import { DragCmp, TooltipCmp, ZenCard } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import cls from "./App.module.css"
import DeckGroup from "./DeckGroup"
import DrawerGroup from "./DrawerGroup"



const App: FunctionComponent = () => {

	// STORES
	const docsSa = useStore(docsSo)

	// HOOKS

	// HANDLERS

	// RENDER
	const clsContent = `${cls.content} ${cls[docsSa.drawerPosition]}`

	return (
		<div className={cls.root}>

			<ZenCard />

			<MainMenu />

			<div className={clsContent}>
				<DeckGroup />
				<DrawerGroup />
			</div>

			<DragCmp />
			<TooltipCmp />
		</div>
	)
}

export default App
