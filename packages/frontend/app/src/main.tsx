import './index.css';

import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './app';

const root = document.getElementById('root');

if (root) {
  const reactRoot = createRoot(root);

  const render = () => {
    reactRoot.render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
  };

  render();

  // // Enable HMR for React components
  // if (import.meta.hot) {
  //   import.meta.hot.accept('./app', () => {
  //     render();
  //   });
  // }
}
