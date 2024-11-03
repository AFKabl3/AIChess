import { Box } from "@mui/material";
import { useEffect } from "react";
import { api } from "../api/api";
import { ExampleComponent } from "../components/exampleComponent/ExampleComponent";

export const ExamplePage = () => {
  useEffect(() => {
    const fetchData = async () => {
      const response = await api.example("exampleId");
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
