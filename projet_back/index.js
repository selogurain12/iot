const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
const usersRoutes = require("./routes/users");

// app.use("/matchings", matchingsRoutes);
app.use("/users", usersRoutes);
app.get("/", (req, res) => {
  res.send("Hello World !");
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});