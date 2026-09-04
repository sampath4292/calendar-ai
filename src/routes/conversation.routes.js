const express = require("express");

const {
    requireAuth
} = require("../middleware/auth.middleware");

const {
    listConversations,
    getConversation,
    deleteConversation
} = require("../controllers/conversation.controller");


const router = express.Router();


router.get(
    "/",
    requireAuth,
    listConversations
);


router.get(
    "/:conversationId",
    requireAuth,
    getConversation
);


router.delete(
    "/:conversationId",
    requireAuth,
    deleteConversation
);


module.exports = router;