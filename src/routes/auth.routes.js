const express = require("express");
const crypto = require("crypto");
const { google } = require("googleapis");

const {
    createOAuth2Client,
    GOOGLE_SCOPES
} = require("../config/google");

const prisma = require("../config/database");

const router = express.Router();

/**
 * Start Google OAuth
 */
router.get("/google", (req, res) => {
    const state = crypto.randomBytes(32).toString("hex");

    req.session.oauthState = state;

    const oauth2Client = createOAuth2Client();

    const authorizationUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: GOOGLE_SCOPES,
        include_granted_scopes: true,
        state
    });

    res.redirect(authorizationUrl);
});


/**
 * Google OAuth callback
 */
router.get("/google/callback", async (req, res) => {
    try {
        const { code, state, error } = req.query;

        // Google returned an authorization error
        if (error) {
            return res.status(400).json({
                error: "Google authorization failed",
                details: error
            });
        }

        // Validate OAuth state
        if (!state || state !== req.session.oauthState) {
            return res.status(400).json({
                error: "Invalid OAuth state"
            });
        }

        // Authorization code is required
        if (!code) {
            return res.status(400).json({
                error: "Authorization code missing"
            });
        }

        // Create a fresh OAuth client for this request
        const oauth2Client = createOAuth2Client();

        // Exchange authorization code for tokens
        const { tokens } = await oauth2Client.getToken(code);

        oauth2Client.setCredentials(tokens);

        // Get Google user information
        const oauth2 = google.oauth2({
            auth: oauth2Client,
            version: "v2"
        });

        const { data: userInfo } = await oauth2.userinfo.get();

        /*
         * ------------------------------------------------
         * Find or create application user
         * ------------------------------------------------
         */

        const user = await prisma.user.upsert({
            where: {
                googleId: userInfo.id
            },
            update: {
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture
            },
            create: {
                googleId: userInfo.id,
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture
            }
        });

        /*
         * ------------------------------------------------
         * Save Google OAuth credentials
         * ------------------------------------------------
         */

        const credentialData = {
            accessToken: tokens.access_token,
            expiryDate: tokens.expiry_date
                ? new Date(tokens.expiry_date)
                : null
        };

        /*
         * Google may NOT return a refresh token
         * on every login.
         *
         * Therefore:
         * - If we have a new refresh token → update it
         * - If not → preserve the existing one
         */

        if (tokens.refresh_token) {
            credentialData.refreshToken = tokens.refresh_token;
        }

        await prisma.googleCredential.upsert({
            where: {
                userId: user.id
            },
            update: credentialData,
            create: {
                userId: user.id,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token || null,
                expiryDate: tokens.expiry_date
                    ? new Date(tokens.expiry_date)
                    : null
            }
        });

        /*
         * ------------------------------------------------
         * Store only our application user ID in session
         * ------------------------------------------------
         */

        req.session.userId = user.id;

        // Do NOT store OAuth tokens in the session.
        delete req.session.tokens;

        // OAuth state is no longer needed
        delete req.session.oauthState;


        res.json({
            message: "Google authentication successful",
            user: {
                id: user.id,
                googleId: user.googleId,
                email: user.email,
                name: user.name,
                picture: user.picture
            }
        });

    } catch (error) {
        console.error("Google OAuth error:", error);

        res.status(500).json({
            error: "Google authentication failed"
        });
    }
});
router.get("/me", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                authenticated: false,
                message: "Not authenticated"
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                id: req.session.userId
            },
            select: {
                id: true,
                googleId: true,
                email: true,
                name: true,
                picture: true
            }
        });

        if (!user) {
            return res.status(401).json({
                authenticated: false,
                message: "User no longer exists"
            });
        }

        res.json({
            authenticated: true,
            user
        });

    } catch (error) {
        console.error("Get current user error:", error);

        res.status(500).json({
            error: "Failed to get current user"
        });
    }
});

module.exports = router;