const calendarService = require("../services/calendar.service");

const {
    validateCreateEvent,
    validateUpdateEvent
} = require("../validators/calendar.validator");


async function listEvents(req, res, next) {
    try {

        const { timeMin, timeMax } = req.query;

        const events = await calendarService.listEvents(
            req.user.id,
            {
                timeMin,
                timeMax
            }
        );

        res.status(200).json({
            events
        });

    } catch (error) {
        next(error);
    }
}


async function getEvent(req, res, next) {
    try {

        const event = await calendarService.getEvent(
            req.user.id,
            req.params.eventId
        );

        res.status(200).json(event);

    } catch (error) {
        next(error);
    }
}


async function createEvent(req, res, next) {
    try {

        const errors = validateCreateEvent(req.body);

        if (errors.length > 0) {
            return res.status(400).json({
                error: "Invalid event data",
                details: errors
            });
        }

        const createdEvent = await calendarService.createEvent(
            req.user.id,
            req.body
        );

        res.status(201).json({
            message: "Calendar event created successfully",
            event: createdEvent
        });

    } catch (error) {
        next(error);
    }
}


async function updateEvent(req, res, next) {
    try {

        const errors = validateUpdateEvent(req.body);

        if (errors.length > 0) {
            return res.status(400).json({
                error: "Invalid event data",
                details: errors
            });
        }

        const updatedEvent = await calendarService.updateEvent(
            req.user.id,
            req.params.eventId,
            req.body
        );

        res.status(200).json({
            message: "Calendar event updated successfully",
            event: updatedEvent
        });

    } catch (error) {
        next(error);
    }
}


async function deleteEvent(req, res, next) {
    try {

        await calendarService.deleteEvent(
            req.user.id,
            req.params.eventId
        );

        res.status(200).json({
            message: "Calendar event deleted successfully"
        });

    } catch (error) {
        next(error);
    }
}


module.exports = {
    listEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent
};