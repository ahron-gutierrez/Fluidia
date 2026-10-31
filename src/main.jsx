import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/index.css";
import App from "./App.jsx";

// A data router (instead of <BrowserRouter>) lets pages block navigation with useBlocker.
// App keeps its own <Routes>, nested under this catch-all.
const router = createBrowserRouter([{ path: "*", element: <App /> }]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
