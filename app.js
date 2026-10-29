
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

// ================= CONFIG =================
const PORT = Number(process.env.PORT) || 3000;
const USE_MOCK = process.env.USE_MOCK === "true";

// ================= MIDDLEWARE =================
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= ROUTES =================
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        mode: USE_MOCK ? "MOCK" : "SQL_SERVER",
    });
});

// Import routes
// Giữ nguyên đường dẫn import theo cấu trúc project của bạn
const authRoutes = require("./src/routes/authRoutes");
const usersRoutes = require("./src/routes/usersRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);

// ================= ERROR HANDLING =================
const errorHandler = require("./src/middlewares/errorHandler");

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `API ${req.originalUrl} not found`,
    });
});

// Global Error Handler
app.use(errorHandler);

// ================= START SERVER =================
async function startServer() {
    try {
        // Chỉ cần kết nối database khi không dùng MOCK
        if (!USE_MOCK) {
            const { getPool } = require("./src/config/database");
            await getPool();
            console.log("✅ SQL Server connected successfully");
        } else {
            console.log("✅ Running with MOCK DATA");
        }

        app.listen(PORT, () => {
            console.log("=================================");
            console.log("🚀 Backend Server Started");
            console.log(`🌐 URL: http://localhost:${PORT}`);
            console.log(`📦 Mode: ${USE_MOCK ? "MOCK" : "SQL SERVER"}`);
            console.log("=================================");
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
}

if (require.main === module) {
    startServer();
}

module.exports = app;
