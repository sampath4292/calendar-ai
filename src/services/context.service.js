const prisma = require("../config/database");

const MAX_CONTEXT_MESSAGES = 20;


async function getConversationContext(
    conversationId
) {

    const messages = await prisma.message.findMany({
        where: {
            conversationId
        },
        orderBy: {
            createdAt: "desc"
        },
        take: MAX_CONTEXT_MESSAGES,
        select: {
            role: true,
            content: true,
            createdAt: true
        }
    });


    return messages.reverse();
}


module.exports = {
    getConversationContext,
    MAX_CONTEXT_MESSAGES
};