const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const processRoutes = require("./routes/processRoutes");
const itemRoutes = require("./routes/itemRoutes");
const jenisRoutes = require("./routes/jenisRoutes");
const platformRoutes = require("./routes/platformRoutes");
const tokoRoutes = require("./routes/tokoRoutes");
const ekspedisiRoutes = require("./routes/ekspedisiRoutes");

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/process", processRoutes);
app.use("/item", itemRoutes);
app.use("/jenis", jenisRoutes);
app.use("/platform", platformRoutes);
app.use("/toko", tokoRoutes);
app.use("/ekspedisi", ekspedisiRoutes);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
