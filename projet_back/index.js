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
const mqttRoutes = require("./routes/mqtt");
const moduleRoutes = require("./routes/module");

app.use("/users", usersRoutes);
app.use("/rfid", rfidRoutes);
app.use("/mqtt", mqttRoutes);
app.use("/module", moduleRoutes);

app.get("/", (req, res) => {
  res.send("Hello World !");
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
  console.log(`📚 Swagger documentation: http://localhost:${PORT}/api-docs`);
});