import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router";
import './index.css';
import Home from './Home';
import Recipes from './components/Recipes';
import Patterns from './components/Patterns';
import Tabs from './components/Tabs';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="recipes" element={<Recipes />} />
        <Route path="recipes/:id" element={<Recipes />} />
        <Route path="patterns" element={<Patterns />} />
        <Route path="patterns/:id" element={<Patterns />} />
        <Route path="tabs" element={<Tabs />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
