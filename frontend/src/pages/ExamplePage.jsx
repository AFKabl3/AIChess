import { Box } from "@mui/material";
import { ExampleComponent } from "../components/exampleComponent/ExampleComponent";

export const ExamplePage = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {[1, 2, 3].map((i) => (
        <ExampleComponent key={i} />
      ))}
    </Box>
  );
};
