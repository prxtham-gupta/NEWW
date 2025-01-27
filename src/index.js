import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import reportWebVitals from './reportWebVitals';
import SessionProvider from './context/SessionProvider';
import { PublicClientApplication } from "@azure/msal-browser";

const msalConfiguration= {
  auth: {
      clientId: "0a4b6572-ad24-47a9-ad85-ead2efb81b93", // the only mandatory field in this object, uniquely identifies your app
      // here you'll add the other fields that you might need based on the Azure portal settings
      authority: "https://login.microsoftonline.com/c3c43524-7c76-4490-aac4-7a82fa8e6496",
      redirectUri: "http://localhost:3000"
  }
};

const pca = new PublicClientApplication(msalConfiguration)
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <MsalProvider instance={pca}>
    <React.StrictMode>
      <BrowserRouter>
        <SessionProvider>
          <App />
        </SessionProvider>
      </BrowserRouter>,
    </React.StrictMode>
  </MsalProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
