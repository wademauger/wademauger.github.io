import React from 'react';
import ReactDOM from 'react-dom/client';
// First import any framework CSS
import './styles/index.css';
// Then import App to let any component-specific CSS be imported through components
import App from './App';
// Finally, import our custom overrides stylesheet that will take precedence
import './styles/typography.css';
import { ConfigProvider, App as AntApp } from 'antd';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ConfigProvider>
      <AntApp>
        <App />
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>
);
