import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Bondly from "./bondly.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Bondly />
  </StrictMode>
);
