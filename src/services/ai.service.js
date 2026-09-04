const groq = require("../config/groq");

const {
    calendarTools,
    executeCalendarTool
} = require("../tools/calendar.tools");


const SYSTEM_INSTRUCTIONS = `
You are a helpful calendar assistant.

You help users manage their Google Calendar.

Rules:

1. Always use calendar tools when calendar data is required.
2. Never invent calendar events.
3. Never claim an event was created, updated, or deleted unless the tool succeeds.
4. Use ISO 8601 date/time values when calling tools.
5. If the user's request is ambiguous, ask for clarification.
6. Do not guess missing important information.
7. The user's calendar is the source of truth.
8. Never ask the user for Google OAuth tokens.
9. Never expose internal IDs unless necessary.
`;


async function chat(userId, conversationMessages) {

    const messages = [
        {
            role: "system",
            content: SYSTEM_INSTRUCTIONS
        },
        ...conversationMessages
    ];


    while (true) {

        const response = await groq.chat.completions.create({
            model: process.env.GROQ_MODEL,
            messages,
            tools: calendarTools,
            tool_choice: "auto"
        });


        const assistantMessage = response.choices[0].message;

        messages.push(assistantMessage);


        if (!assistantMessage.tool_calls) {
            return assistantMessage.content;
        }


        for (const toolCall of assistantMessage.tool_calls) {

            const toolName = toolCall.function.name;

            const argumentsObject = JSON.parse(
                toolCall.function.arguments
            );


            const result = await executeCalendarTool(
                toolName,
                argumentsObject,
                userId
            );


            messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                name: toolName,
                content: JSON.stringify(result)
            });
        }
    }
}


module.exports = {
    chat
};