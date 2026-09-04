const prisma = require("../config/database");
const AppError = require("../errors/app.error");


async function createConversation(userId) {

    return prisma.conversation.create({
        data: {
            userId
        }
    });
}


async function getConversation(
    conversationId,
    userId
) {

    return prisma.conversation.findFirst({
        where: {
            id: conversationId,
            userId
        }
    });
}


async function getOrCreateConversation(
    conversationId,
    userId
) {

    if (!conversationId) {
        return createConversation(userId);
    }

    const conversation = await getConversation(
        conversationId,
        userId
    );

    if (!conversation) {
        throw new AppError(
            "Conversation not found",
            404
        );
    }

    return conversation;
}


async function addMessage(
    conversationId,
    role,
    content
) {

    return prisma.$transaction(async (tx) => {

        const message = await tx.message.create({
            data: {
                conversationId,
                role,
                content
            }
        });

        await tx.conversation.update({
            where: {
                id: conversationId
            },
            data: {
                updatedAt: new Date()
            }
        });

        return message;
    });
}


async function getMessages(
    conversationId
) {

    return prisma.message.findMany({
        where: {
            conversationId
        },
        orderBy: {
            createdAt: "asc"
        }
    });
}


async function listConversations(userId) {

    return prisma.conversation.findMany({
        where: {
            userId
        },
        orderBy: {
            updatedAt: "desc"
        },
        select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            _count: {
                select: {
                    messages: true
                }
            }
        }
    });
}


async function getConversationWithMessages(
    conversationId,
    userId
) {

    const conversation =
        await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userId
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: "asc"
                    }
                }
            }
        });

    if (!conversation) {
        throw new AppError(
            "Conversation not found",
            404
        );
    }

    return conversation;
}


async function deleteConversation(
    conversationId,
    userId
) {

    const conversation =
        await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userId
            }
        });

    if (!conversation) {
        throw new AppError(
            "Conversation not found",
            404
        );
    }

    await prisma.conversation.delete({
        where: {
            id: conversationId
        }
    });

    return {
        success: true
    };
}


module.exports = {
    createConversation,
    getConversation,
    getOrCreateConversation,
    addMessage,
    getMessages,
    listConversations,
    getConversationWithMessages,
    deleteConversation
};