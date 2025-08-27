import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Header from './Components/Header';
import RoutesLanding from './Routes';
import { ContextProvider, ModalProvider } from './Components/Contexts';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ModalProvider>
        <ContextProvider>
          <Header />
          <RoutesLanding />
          {/*  <Footer /> */}
        </ContextProvider>
      </ModalProvider>
    </BrowserRouter>
  </React.StrictMode>
);
