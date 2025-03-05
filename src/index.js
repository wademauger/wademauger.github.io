import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { Routes, Route } from "react-router";
import './index.css';
import Home from './Home';
import AppFrame from './components/AppFrame';
import Recipes from './components/Recipes';
import Patterns from './components/Patterns';
import Tabs from './components/Tabs';
import reportWebVitals from './reportWebVitals';
import { ConfigProvider, theme, Layout } from 'antd';
import LandingPage from './components/ProfessionalLanding';
import Houseplants from './components/Houseplants';
import { Provider } from 'react-redux';
import store from './store';
const { Content } = Layout;

const accentColors = ['#631521', '#633D15', '#616315', '#15632C', '#152E63', '#5C1563'];

const customTheme = {
  token: {
    colorPrimary: accentColors[Math.floor(Math.random() * accentColors.length)],
    colorBgContainer: '#f0f2f5',
    borderRadiusLG: '16px',
  },
};

const App = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Provider store={store}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="*"
          element={
            <AppFrame>
              <Content>
                <Routes>
                  <Route path="hobbies/" element={<Home />}>
                    <Route path="recipes" element={<Recipes />} />
                    <Route path="recipes/:id" element={<Recipes />} />
                    <Route path="patterns" element={<Patterns />} />
                    <Route path="patterns/:id" element={<Patterns />} />
                    <Route path="tabs" element={<Tabs />} />
                    <Route path="houseplants" element={<Houseplants />} />
                  </Route>
                </Routes>
              </Content>
            </AppFrame>
          }
        />
      </Routes>
    </Provider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter basename="/">
      <ConfigProvider theme={customTheme}>
        <App />
      </ConfigProvider>
    </HashRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
