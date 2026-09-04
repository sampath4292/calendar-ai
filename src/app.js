const express = require("express");
const cors = require("cors");
const session = require("express-session");

const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const calendarRoutes = require("./routes/calendar.routes");
const errorHandler = require("./middleware/error.middleware");
const chatRoutes = require("./routes/chat.routes");
const conversationRoutes =require("./routes/conversation.routes");
const app = express();

app.use(cors());
app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 1000 * 60 * 60
        }
    })
);

app.use("/health", healthRoutes);

app.use("/auth", authRoutes);

app.use("/calendar", calendarRoutes);

app.use("/chat", chatRoutes);

app.use(
    "/conversations",
    conversationRoutes
);

app.use(errorHandler);
module.exports = app;