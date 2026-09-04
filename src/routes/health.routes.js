const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    res.status(200).json({
        status: "UP",
        message: "Calendar AI Assistant is running"
    });
});

module.exports = router;