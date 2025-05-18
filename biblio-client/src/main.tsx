import ReactDOM from 'react-dom/client';
import App from './app/App.tsx';


//#region CSS
import "prismjs/themes/prism-funky.css";
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-css';

import '@fontsource/darker-grotesque/800.css';
import '@fontsource-variable/inter';

import './css/index.css';
//import './css/colors.css';
//import './css/colors-var.css';
//import './css/interaction.css';
import './css/label.css';
import './css/layout.css';
import './css/scrollbar.css';
import './css/monaco.css';
import "@priolo/jack/dist/style.css";
//import "@priolo/jack/dist/jack.css";



//#region PLUGIN
//import '@/plugins/msw';
import "./plugins/session";
//#endregion


ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>,
)

