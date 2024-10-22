import { app } from "./app"; // Import your Express app

const PORT = process.env.PORT || 5000;

// Start the server and log the running port
app.listen(PORT, () =>
  console.log(`Server running on port: ${PORT} mode: ${process.env.NODE_ENV}`)
);
