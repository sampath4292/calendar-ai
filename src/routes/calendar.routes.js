const express = require("express");

const {
    requireAuth
} = require("../middleware/auth.middleware");

const {
    listEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent
} = require("../controllers/calendar.controller");

const router = express.Router();


// GET /calendar/events
router.get(
    "/events",
    requireAuth,
    listEvents
);


// GET /calendar/events/:eventId
router.get(
    "/events/:eventId",
    requireAuth,
    getEvent
);


// POST /calendar/events
router.post(
    "/events",
    requireAuth,
    createEvent
);


// PUT /calendar/events/:eventId
router.put(
    "/events/:eventId",
    requireAuth,
    updateEvent
);


// DELETE /calendar/events/:eventId
router.delete(
    "/events/:eventId",
    requireAuth,
    deleteEvent
);


module.exports = router;