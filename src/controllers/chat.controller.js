const aiService = require("../services/ai.service");

const conversationService =
    require("../services/conversation.service");

const contextService =
    require("../services/context.service");


async function chat(req, res, next) {

    try {

        const {
            conversationId,
            message
        } = req.body;


        if (!message || typeof message !== "string") {

            return res.status(400).json({
                error: "Message is required"
            });
        }


        const trimmedMessage = message.trim();


        if (!trimmedMessage) {

            return res.status(400).json({
                error: "Message cannot be empty"
            });
        }


        // Get existing conversation or create a new one
        const conversation =
            await conversationService.getOrCreateConversation(
                conversationId,
                req.user.id
            );


        // Save the user's message
        await conversationService.addMessage(
            conversation.id,
            "user",
            trimmedMessage
        );


        // Get only the recent context for the AI
        const contextMessages =
            await contextService.getConversationContext(
                conversation.id
            );


        // Convert database messages into AI messages
        const aiMessages = contextMessages.map(
            message => ({
                role: message.role,
                content: message.content
            })
        );


        // Send context to AI
        const response = await aiService.chat(
            req.user.id,
            aiMessages
        );


        // Save AI response
        await conversationService.addMessage(
            conversation.id,
            "assistant",
            response
        );


        res.status(200).json({
            conversationId: conversation.id,
            message: response
        });

    } catch (error) {

        next(error);
    }
}


module.exports = {
    chat
};