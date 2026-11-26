
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const database = require("./src/config/connectData");

const warehouseRoutes = require("./src/routes");
const { requireJwtSecret } = require("./src/config/env");
const { notFound, errorHandler, warehouseErrorHandler } = require("./src/middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/warehouse", warehouseRoutes, warehouseErrorHandler);
app.use(notFound);
app.use(errorHandler);

// Start Server
async function startServer() {
    try {
        requireJwtSecret();
        await database.getPool();

        console.log("✅ SQL Server connected successfully");

        app.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("❌ Server startup failed:", error.message);
        process.exit(1);
    }
}

if (require.main === module) startServer();

module.exports = app;
