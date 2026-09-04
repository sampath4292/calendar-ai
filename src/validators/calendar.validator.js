function validateCreateEvent(event) {
    const errors = [];

    if (!event || typeof event !== "object") {
        return ["Request body must be an object"];
    }

    if (!event.summary || typeof event.summary !== "string") {
        errors.push("summary is required");
    }

    if (!event.start || typeof event.start !== "object") {
        errors.push("start is required");
    }

    if (!event.end || typeof event.end !== "object") {
        errors.push("end is required");
    }

    if (event.start && !event.start.dateTime && !event.start.date) {
        errors.push("start must contain dateTime or date");
    }

    if (event.end && !event.end.dateTime && !event.end.date) {
        errors.push("end must contain dateTime or date");
    }

    return errors;
}


function validateUpdateEvent(event) {
    return validateCreateEvent(event);
}


module.exports = {
    validateCreateEvent,
    validateUpdateEvent
};