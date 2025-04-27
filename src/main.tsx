import ReactDOM from "react-dom/client";
import App from "./App";
import '@mantine/core/styles.css';
import { BrowserRouter } from "react-router-dom";
import { createTheme, MantineProvider } from "@mantine/core";

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(rootElement);

const theme = createTheme({});

root.render(
    <MantineProvider theme={theme} defaultColorScheme="dark">
    <BrowserRouter>
        <App />
    </BrowserRouter>
    </MantineProvider>
);
