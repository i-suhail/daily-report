const path = require("path");
const reportRoutes = require("./routes/reportRoutes");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./config/db");
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());
app.use("/api/reports", reportRoutes);
app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT NOW() AS current_time"
        );
        res.json({
            message: "Database connection successful",
            databaseTime: result.rows[0].current_time
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Database connection failed",
            error: error.message
        });
    }
});
app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );
});
app.listen(PORT, () => {
    console.log(
        `🚀 LG Daily Report server running on http://localhost:${PORT}`
    );
});