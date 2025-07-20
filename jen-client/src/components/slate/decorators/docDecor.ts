
// const decorateCode = ([node, path]) => {
// 	const ranges = []
// 	if (node.type === 'code') {
// 	  const text = Node.string(node)
// 	  const language = 'javascript' // Cambia questa riga per supportare altri linguaggi
// 	  const { value } = hljs.highlight(text, { language })
// 	  const tokens = value.split(/\r\n|\r|\n/

import Prism from "prismjs";
import { Node } from "slate";

	  
// 	  let start = 0
// 	  for (const token of tokens) {
// 		const length = token.length
// 		const end = start + length
  
// 		const tokenClasses = token.match(/class="([^"]+)"/)?.[1]
// 		if (tokenClasses) {
// 		  ranges.push({
// 			anchor: { path, offset: start },
// 			focus: { path, offset: end },
// 			className: tokenClasses,
// 		  })
// 		}
  
// 		start = end + 1 // +1 per il carattere di nuova riga
// 	  }
// 	}
// 	return ranges
//   }
export const docDecor = ([node, path]) => {
	const ranges = []
	if (node.type === 'code') {
		console.log("decorateCode")
		const text = Node.string(node)
		const tokens = Prism.tokenize(text, Prism.languages.javascript)
		let start = 0

		for (const token of tokens) {
			const length = token.length
			const end = start + length

			if (typeof token !== 'string') {
				ranges.push({
					anchor: { path, offset: start },
					focus: { path, offset: end },
					className: `token ${token.type}`,
				})
			}

			start = end
		}
	}
	return ranges
}
