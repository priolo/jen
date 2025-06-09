import { Text } from "slate"
import Prism from "prismjs"



export const mdDecor = ([node, path]) => {
	const ranges = []
	if (!Text.isText(node)) return ranges

	// helper per calcolare lunghezza token
	const getLength = token =>
		typeof token === 'string'
			? token.length
			: typeof token.content === 'string'
				? token.content.length
				: token.content.reduce((l, t) => l + getLength(t), 0)

	// Prism tokenizza il testo in base alla grammatica Markdown
	const tokens = Prism.tokenize(node.text, Prism.languages.markdown)
	let start = 0

	for (const token of tokens) {
		const length = getLength(token)
		const end = start + length

		if (typeof token !== 'string') {
			ranges.push({
				[token.type]: true,
				anchor: { path, offset: start },
				focus: { path, offset: end }
			})
		}
		start = end
	}

	return ranges
}