const calendarService = require("../services/calendar.service");


const calendarTools = [
    {
        type: "function",
        function: {
            name: "list_calendar_events",
            description:
                "List the user's calendar events within a specified time range.",
            parameters: {
                type: "object",
                properties: {
                    start: {
                        type: "string",
                        description:
                            "Start of the time range in ISO 8601 format."
                    },
                    end: {
                        type: "string",
                        description:
                            "End of the time range in ISO 8601 format."
                    }
                },
                required: ["start", "end"],
                additionalProperties: false
            }
        }
    },

    {
        type: "function",
        function: {
            name: "get_calendar_event",
            description:
                "Retrieve a specific calendar event using its event ID.",
            parameters: {
                type: "object",
                properties: {
                    eventId: {
                        type: "string",
                        description:
                            "The Google Calendar event ID."
                    }
                },
                required: ["eventId"],
                additionalProperties: false
            }
        }
    },

    {
        type: "function",
        function: {
            name: "create_calendar_event",
            description:
                "Create a new event in the user's primary Google Calendar.",
            parameters: {
                type: "object",
                properties: {
                    title: {
                        type: "string",
                        description:
                            "Title of the calendar event."
                    },
                    description: {
                        type: "string",
                        description:
                            "Optional description of the event."
                    },
                    start: {
                        type: "string",
                        description:
                            "Event start time in ISO 8601 format."
                    },
                    end: {
                        type: "string",
                        description:
                            "Event end time in ISO 8601 format."
                    },
                    timeZone: {
                        type: "string",
                        description:
                            "IANA time zone such as Asia/Kolkata."
                    }
                },
                required: [
                    "title",
                    "start",
                    "end",
                    "timeZone"
                ],
                additionalProperties: false
            }
        }
    },

    {
        type: "function",
        function: {
            name: "update_calendar_event",
            description:
                "Update an existing calendar event.",
            parameters: {
                type: "object",
                properties: {
                    eventId: {
                        type: "string",
                        description:
                            "The Google Calendar event ID."
                    },
                    title: {
                        type: "string",
                        description:
                            "Updated title of the event."
                    },
                    description: {
                        type: "string",
                        description:
                            "Updated description."
                    },
                    start: {
                        type: "string",
                        description:
                            "Updated start time in ISO 8601 format."
                    },
                    end: {
                        type: "string",
                        description:
                            "Updated end time in ISO 8601 format."
                    },
                    timeZone: {
                        type: "string",
                        description:
                            "IANA time zone such as Asia/Kolkata."
                    }
                },
                required: [
                    "eventId",
                    "title",
                    "start",
                    "end",
                    "timeZone"
                ],
                additionalProperties: false
            }
        }
    },

    {
        type: "function",
        function: {
            name: "delete_calendar_event",
            description:
                "Delete an existing calendar event.",
            parameters: {
                type: "object",
                properties: {
                    eventId: {
                        type: "string",
                        description:
                            "The Google Calendar event ID."
                    }
                },
                required: ["eventId"],
                additionalProperties: false
            }
        }
    }
];


async function executeCalendarTool(
    toolName,
    argumentsObject,
    userId
) {

    switch (toolName) {

        case "list_calendar_events":

            return calendarService.listEvents(
                userId,
                {
                    timeMin: argumentsObject.start,
                    timeMax: argumentsObject.end
                }
            );


        case "get_calendar_event":

            return calendarService.getEvent(
                userId,
                argumentsObject.eventId
            );


        case "create_calendar_event":

            return calendarService.createEvent(
                userId,
                {
                    summary: argumentsObject.title,
                    description: argumentsObject.description,

                    start: {
                        dateTime: argumentsObject.start,
                        timeZone: argumentsObject.timeZone
                    },

                    end: {
                        dateTime: argumentsObject.end,
                        timeZone: argumentsObject.timeZone
                    }
                }
            );


        case "update_calendar_event":

            return calendarService.updateEvent(
                userId,
                argumentsObject.eventId,
                {
                    summary: argumentsObject.title,
                    description: argumentsObject.description,

                    start: {
                        dateTime: argumentsObject.start,
                        timeZone: argumentsObject.timeZone
                    },

                    end: {
                        dateTime: argumentsObject.end,
                        timeZone: argumentsObject.timeZone
                    }
                }
            );


        case "delete_calendar_event":

            return calendarService.deleteEvent(
                userId,
                argumentsObject.eventId
            );


        default:

            throw new Error(
                `Unknown calendar tool: ${toolName}`
            );
    }
}


module.exports = {
    calendarTools,
    executeCalendarTool
};