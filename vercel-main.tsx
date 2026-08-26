import React from "react";
import {createRoot} from "react-dom/client";
import Home from "./app/page";
import "./app/globals.css";
import "./app/screens.css";
import "./app/linear.css";
import "./app/layers.css";
import "./app/controls.css";
import "./app/links.css";
import "./app/integrated.css";
import "./app/play.css";
import "./app/evidence.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>,
);
