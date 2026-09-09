import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PreviewRoleProvider } from "./contexts/PreviewRoleContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <PreviewRoleProvider>
      <App />
    </PreviewRoleProvider>
  </ThemeProvider>
);