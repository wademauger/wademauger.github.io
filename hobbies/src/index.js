import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route } from "react-router";
import './index.css';
import Home from './Home';
import AppFrame from './components/AppFrame';
import Recipes from './components/Recipes';
import Patterns from './components/Patterns';
import Tabs from './components/Tabs';
import reportWebVitals from './reportWebVitals';
import { ConfigProvider, theme, Layout } from 'antd';
const { Content } = Layout;

const customTheme = {
  token: {
    colorPrimary: '#156064', // Change this to your desired primary color
    colorBgContainer: '#f0f2f5', // Change this to your desired background color
    borderRadiusLG: '8px', // Change this to your desired border radius
  },
};

const App = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <AppFrame>
      <Content
        style={{
          padding: '0 48px',
        }}
      >
        <div
          style={{
            marginTop: 24,
            padding: 24,
            minHeight: 380,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Routes>
            <Route index element={<Home />} />
            <Route path="recipes" element={<Recipes />} />
            <Route path="recipes/:id" element={<Recipes />} />
            <Route path="patterns" element={<Patterns />} />
            <Route path="patterns/:id" element={<Patterns />} />
            <Route path="tabs" element={<Tabs />} />
          </Routes>
        </div>
      </Content>
    </AppFrame>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider theme={customTheme}>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
