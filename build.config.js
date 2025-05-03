// build.config.js
export default {
	entrypoints: ['./src/start.ts'],
	outdir: './dist',
	target: 'node',  // Importante per build server-side
	minify: {
	  whitespace: true,
	  identifiers: true,
	  syntax: true
	},
	sourcemap: 'external',
	external: [
	  // Dipendenze che non devono essere bundled
	  //'express',
	  //'mongoose',
	  // Aggiungi qui altre dipendenze di produzione
	],
	define: {
	  'process.env.NODE_ENV': '"production"'
	},
	// Mantiene la struttura delle cartelle
	naming: {
	  entry: '[dir]/[name].js',
	  chunk: 'chunks/[name]-[hash].js',
	  asset: 'assets/[name]-[hash][ext]'
	}
  };