const googleCalendarProvider = require("../providers/google-calendar.provider");


async function listEvents(userId, options = {}) {
    return googleCalendarProvider.listEvents(userId, options);
}


async function getEvent(userId, eventId, calendarId = "primary") {
    return googleCalendarProvider.getEvent(
        userId,
        eventId,
        calendarId
    );
}


async function createEvent(
    userId,
    event,
    calendarId = "primary"
) {
    return googleCalendarProvider.createEvent(
        userId,
        event,
        calendarId
    );
}


async function updateEvent(
    userId,
    eventId,
    event,
    calendarId = "primary"
) {
    return googleCalendarProvider.updateEvent(
        userId,
        eventId,
        event,
        calendarId
    );
}


async function deleteEvent(
    userId,
    eventId,
    calendarId = "primary"
) {
    return googleCalendarProvider.deleteEvent(
        userId,
        eventId,
        calendarId
    );
}


module.exports = {
    listEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent
};