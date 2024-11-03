import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

// Import Roboto font styles
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { Typography } from "@mui/material";
import { ExamplePage } from "./pages/ExamplePage.jsx";
import ChessPage  from "./pages/ChessPage.jsx";
import Root from "./Root.jsx";
import theme from "./theme.js";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        element: <Typography variant="h1">Welcome to AIChess</Typography>,
      },
      {
        path: "example",
        element: <ExamplePage />,
      },
      {
        path: "chess",
        element: <ChessPage />,
      },
      {
        path: "/*",
        element: <Typography variant="h1">To be implemented</Typography>,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
);
