import { MotionConfig } from "framer-motion";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { LoanDataProvider } from "./context/LoanDataContext.jsx";
import "./styles/base-styles.scss";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <LoanDataProvider>
          <App />
        </LoanDataProvider>
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>,
);
