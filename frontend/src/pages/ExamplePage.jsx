import { Box } from "@mui/material";
import { useEffect } from "react";
import { api } from "../api/api";
import { ExampleComponent } from "../components/exampleComponent/ExampleComponent";

export const ExamplePage = () => {
  useEffect(() => {
    const fetchData = async () => {
      const response = await api.evaluateMove(
        "8/1P1R4/n1r2B2/3Pp3/1k4P1/6K1/Bppr1P2/2q5 w - - 0 1",
        "b7b8q"
      );
      const data = await response.json();
      console.log(data);
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {[1, 2, 3].map((i) => (
        <ExampleComponent key={i} />
      ))}
    </Box>
  );
};
