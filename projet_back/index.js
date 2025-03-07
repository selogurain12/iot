const express = require("express");
const dotenv = require("dotenv");
const setupSwagger = require('./swagger');
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Swagger
setupSwagger(app);

// Routes
const usersRoutes = require("./routes/users");
const rfidRoutes = require("./routes/rfid");

app.use("/users", usersRoutes);
app.use("/rfid", rfidRoutes);

app.get("/", (req, res) => {
  res.send("Hello World !");
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📚 Documentation Swagger : http://localhost:${PORT}/api-docs`);
});