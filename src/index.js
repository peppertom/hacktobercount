import { h, render } from 'preact';
import App from './App/App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

render(<App />, document.getElementById('root'));
registerServiceWorker();
