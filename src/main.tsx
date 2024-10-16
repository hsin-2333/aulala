import { NextUIProvider } from "@nextui-org/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NextUIProvider className="light text-foreground bg-background">
      <App />
    </NextUIProvider>
  </StrictMode>
);
