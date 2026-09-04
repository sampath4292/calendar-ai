const { google } = require("googleapis");

const {
    createOAuth2Client
} = require("../config/google");

const prisma = require("../config/database");


async function getCalendarClient(userId) {

    const credential = await prisma.googleCredential.findUnique({
        where: {
            userId
        }
    });

    if (!credential) {
        throw new Error("Google credentials not found");
    }

    const oauth2Client = createOAuth2Client();

    oauth2Client.setCredentials({
        access_token: credential.accessToken,
        refresh_token: credential.refreshToken,
        expiry_date: credential.expiryDate
            ? credential.expiryDate.getTime()
            : undefined
    });

    const calendar = google.calendar({
        version: "v3",
        auth: oauth2Client
    });

    return calendar;
}


async function listEvents(userId, options = {}) {

    const calendar = await getCalendarClient(userId);

    const response = await calendar.events.list({
        calendarId: options.calendarId || "primary",
        timeMin: options.timeMin,
        timeMax: options.timeMax,
        singleEvents: true,
        orderBy: "startTime"
    });

    return response.data.items || [];
}


async function getEvent(userId, eventId, calendarId = "primary") {

    const calendar = await getCalendarClient(userId);

    const response = await calendar.events.get({
        calendarId,
        eventId
    });

    return response.data;
}


async function createEvent(
    userId,
    event,
    calendarId = "primary"
) {

    const calendar = await getCalendarClient(userId);

    const response = await calendar.events.insert({
        calendarId,
        requestBody: event
    });

    return response.data;
}


async function updateEvent(
    userId,
    eventId,
    event,
    calendarId = "primary"
) {

    const calendar = await getCalendarClient(userId);

    const response = await calendar.events.update({
        calendarId,
        eventId,
        requestBody: event
    });

    return response.data;
}


async function deleteEvent(
    userId,
    eventId,
    calendarId = "primary"
) {

    const calendar = await getCalendarClient(userId);

    await calendar.events.delete({
        calendarId,
        eventId
    });

    return {
        success: true
    };
}


module.exports = {
    listEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent
};