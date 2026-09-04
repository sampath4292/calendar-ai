const conversationService =
    require("../services/conversation.service");


async function listConversations(
    req,
    res,
    next
) {

    try {

        const conversations =
            await conversationService.listConversations(
                req.user.id
            );

        res.status(200).json({
            conversations
        });

    } catch (error) {

        next(error);
    }
}


async function getConversation(
    req,
    res,
    next
) {

    try {

        const conversation =
            await conversationService
                .getConversationWithMessages(
                    req.params.conversationId,
                    req.user.id
                );

        res.status(200).json({
            conversation
        });

    } catch (error) {

        next(error);
    }
}


async function deleteConversation(
    req,
    res,
    next
) {

    try {

        const result =
            await conversationService.deleteConversation(
                req.params.conversationId,
                req.user.id
            );

        res.status(200).json(result);

    } catch (error) {

        next(error);
    }
}


module.exports = {
    listConversations,
    getConversation,
    deleteConversation
};