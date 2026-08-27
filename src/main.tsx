import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthInitializer } from "./app/authInitializer";
import { Provider } from "react-redux";
import { store } from "./app/store.ts";

// Applied before first paint so every page (including the login screen)
// renders with the right theme immediately — see hooks/use-theme.ts.
const storedTheme = window.localStorage.getItem("gdmr-theme");
document.documentElement.classList.toggle("dark", storedTheme !== "light");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <AuthInitializer>
        <App />
      </AuthInitializer>
    </Provider>
  </StrictMode>,
);
