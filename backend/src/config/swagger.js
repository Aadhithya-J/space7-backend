const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'space7 API',
        version: '1.0.0',
        description: 'Complete REST API for the space7 discussion platform. Includes authentication, space management, real-time messaging with media support, user profiles, notifications, and invite code system.',
        contact: { name: 'space7 Backend Team' },
    },
    servers: [
        { url: 'http://localhost:5000/api', description: 'Local development' },
    ],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Pass the JWT token obtained from `/auth/login` or `/auth/verify-otp`',
            },
        },
        schemas: {
            // ─── Auth ───
            SignupRequest: {
                type: 'object',
                required: ['username', 'email', 'password'],
                properties: {
                    username: { type: 'string', minLength: 3, maxLength: 50, example: 'john_doe' },
                    email: { type: 'string', format: 'email', example: 'john@example.com' },
                    password: { type: 'string', minLength: 6, maxLength: 128, example: 'SecureP@ss1' },
                },
            },
            VerifyOtpRequest: {
                type: 'object',
                required: ['email', 'otp'],
                properties: {
                    email: { type: 'string', format: 'email', example: 'john@example.com' },
                    otp: { type: 'string', minLength: 6, maxLength: 6, example: '123456' },
                },
            },
            LoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email', example: 'john@example.com' },
                    password: { type: 'string', example: 'SecureP@ss1' },
                },
            },
            AuthResponse: {
                type: 'object',
                properties: {
                    token: { type: 'string', description: 'JWT access token' },
                    user: { $ref: '#/components/schemas/UserSummary' },
                },
            },
            ForgotPasswordRequest: {
                type: 'object',
                required: ['email'],
                properties: {
                    email: { type: 'string', format: 'email', example: 'john@example.com' },
                },
            },
            ResetPasswordRequest: {
                type: 'object',
                required: ['email', 'otp', 'newPassword'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    otp: { type: 'string', minLength: 6, maxLength: 6 },
                    newPassword: { type: 'string', minLength: 6, maxLength: 128 },
                },
            },

            // ─── User ───
            UserSummary: {
                type: 'object',
                properties: {
                    user_id: { type: 'string', format: 'uuid' },
                    username: { type: 'string' },
                    profile_picture: { type: 'string', nullable: true },
                },
            },
            UserProfile: {
                type: 'object',
                properties: {
                    user_id: { type: 'string', format: 'uuid' },
                    username: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    bio: { type: 'string', nullable: true },
                    profile_picture: { type: 'string', nullable: true },
                    total_words: { type: 'integer' },
                    created_at: { type: 'string', format: 'date-time' },
                },
            },

            // ─── Space ───
            CreateSpaceRequest: {
                type: 'object',
                required: ['title', 'description'],
                properties: {
                    title: { type: 'string', minLength: 3, maxLength: 200, example: 'AI Ethics Discussion' },
                    description: { type: 'string', minLength: 10, example: 'A space to discuss ethical implications of AI technology' },
                    visibility: { type: 'string', enum: ['public', 'private'], default: 'public' },
                    hashtags: { type: 'array', items: { type: 'string' }, maxItems: 10, example: ['ai', 'ethics'] },
                },
            },
            JoinSpaceRequest: {
                type: 'object',
                properties: {
                    invite_code: { type: 'string', description: 'Required for private spaces', example: 'A1B2C3D4' },
                },
            },
            Space: {
                type: 'object',
                properties: {
                    space_id: { type: 'string', format: 'uuid' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    visibility: { type: 'string', enum: ['public', 'private'] },
                    is_locked: { type: 'boolean' },
                    is_archived: { type: 'boolean' },
                    creator_id: { type: 'string', format: 'uuid' },
                    creator: { $ref: '#/components/schemas/UserSummary' },
                    members: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'integer' },
                                role: { type: 'string', enum: ['creator', 'member'] },
                                user: { $ref: '#/components/schemas/UserSummary' },
                            },
                        },
                    },
                    tags: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                tag_id: { type: 'integer' },
                                tag_name: { type: 'string' },
                            },
                        },
                    },
                    participant_count: { type: 'integer' },
                    message_count: { type: 'integer' },
                    created_at: { type: 'string', format: 'date-time' },
                },
            },
            SpaceListItem: {
                type: 'object',
                properties: {
                    space_id: { type: 'string', format: 'uuid' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    visibility: { type: 'string', enum: ['public', 'private'] },
                    creator: { $ref: '#/components/schemas/UserSummary' },
                    participant_count: { type: 'integer' },
                    tags: { type: 'array', items: { type: 'object', properties: { tag_id: { type: 'integer' }, tag_name: { type: 'string' } } } },
                },
            },

            // ─── Invite Code ───
            InviteCode: {
                type: 'object',
                properties: {
                    code_id: { type: 'integer' },
                    space_id: { type: 'string', format: 'uuid' },
                    code: { type: 'string', example: 'A1B2C3D4' },
                    created_by: { type: 'string', format: 'uuid' },
                    expires_at: { type: 'string', format: 'date-time' },
                    is_used: { type: 'boolean' },
                    used_by: { type: 'string', format: 'uuid', nullable: true },
                    status: { type: 'string', enum: ['active', 'used', 'expired'] },
                    usedByUser: { $ref: '#/components/schemas/UserSummary' },
                },
            },

            // ─── Message ───
            Message: {
                type: 'object',
                properties: {
                    message_id: { type: 'string', format: 'uuid' },
                    space_id: { type: 'string', format: 'uuid' },
                    sender_id: { type: 'string', format: 'uuid' },
                    content: { type: 'string', nullable: true },
                    media_url: { type: 'string', nullable: true, description: 'Cloudinary URL of uploaded media' },
                    media_type: { type: 'string', enum: ['image', 'video', 'audio'], nullable: true },
                    word_count: { type: 'integer' },
                    sender: { $ref: '#/components/schemas/UserSummary' },
                    likes: {
                        type: 'array',
                        items: { type: 'object', properties: { id: { type: 'integer' }, user_id: { type: 'string', format: 'uuid' } } },
                    },
                    appreciation_count: { type: 'integer' },
                    created_at: { type: 'string', format: 'date-time' },
                },
            },
            MessageListResponse: {
                type: 'object',
                properties: {
                    messages: { type: 'array', items: { $ref: '#/components/schemas/Message' } },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    totalPages: { type: 'integer' },
                },
            },

            // ─── Notification ───
            Notification: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    user_id: { type: 'string', format: 'uuid' },
                    type: { type: 'string', enum: ['new_message', 'appreciation_received', 'space_invite', 'member_joined'] },
                    message: { type: 'string' },
                    reference_id: { type: 'string' },
                    is_read: { type: 'boolean' },
                    created_at: { type: 'string', format: 'date-time' },
                },
            },
            NotificationListResponse: {
                type: 'object',
                properties: {
                    notifications: { type: 'array', items: { $ref: '#/components/schemas/Notification' } },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    totalPages: { type: 'integer' },
                    unreadCount: { type: 'integer' },
                },
            },

            // ─── Generic ───
            Error: {
                type: 'object',
                properties: {
                    error: { type: 'string' },
                },
            },
            SuccessMessage: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                },
            },
        },
    },
    paths: {
        // ════════════════════════════════════════
        //  HEALTH
        // ════════════════════════════════════════
        '/health': {
            get: {
                tags: ['Health'],
                summary: 'Health check',
                description: 'Returns server status and timestamp.',
                responses: {
                    200: {
                        description: 'Server is running',
                        content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'ok' }, timestamp: { type: 'string', format: 'date-time' } } } } },
                    },
                },
            },
        },

        // ════════════════════════════════════════
        //  AUTH
        // ════════════════════════════════════════
        '/auth/signup': {
            post: {
                tags: ['Authentication'],
                summary: 'Register a new user',
                description: 'Creates a new user account and sends an OTP to the provided email for verification.',
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SignupRequest' } } } },
                responses: {
                    201: { description: 'User created, OTP sent', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string', example: 'OTP sent to your email' }, user_id: { type: 'string', format: 'uuid' } } } } } },
                    400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                    409: { description: 'Email or username already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },
        '/auth/verify-otp': {
            post: {
                tags: ['Authentication'],
                summary: 'Verify email with OTP',
                description: 'Verifies the OTP sent to the user\'s email and activates the account. Returns a JWT token upon success.',
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyOtpRequest' } } } },
                responses: {
                    200: { description: 'Account verified, JWT returned', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
                    400: { description: 'Invalid or expired OTP', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },
        '/auth/login': {
            post: {
                tags: ['Authentication'],
                summary: 'Login with email and password',
                description: 'Authenticates the user and returns a JWT token.',
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
                responses: {
                    200: { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
                    401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },
        '/auth/forgot-password': {
            post: {
                tags: ['Authentication'],
                summary: 'Request password reset OTP',
                description: 'Sends a password reset OTP to the user\'s email.',
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ForgotPasswordRequest' } } } },
                responses: {
                    200: { description: 'Reset OTP sent', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessMessage' } } } },
                    404: { description: 'Email not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },
        '/auth/reset-password': {
            post: {
                tags: ['Authentication'],
                summary: 'Reset password with OTP',
                description: 'Resets the password using the OTP sent via forgot-password.',
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ResetPasswordRequest' } } } },
                responses: {
                    200: { description: 'Password reset successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessMessage' } } } },
                    400: { description: 'Invalid OTP', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },

        // ════════════════════════════════════════
        //  SPACES
        // ════════════════════════════════════════
        '/spaces': {
            post: {
                tags: ['Spaces'],
                summary: 'Create a new space',
                description: 'Creates a new discussion space. The authenticated user becomes the creator.',
                security: [{ BearerAuth: [] }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateSpaceRequest' } } } },
                responses: {
                    201: { description: 'Space created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Space' } } } },
                    400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                    401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },
        '/spaces/trending': {
            get: {
                tags: ['Spaces'],
                summary: 'Get trending spaces',
                description: 'Returns trending spaces sorted by participant count. Public endpoint (no auth required).',
                parameters: [
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Number of spaces to return' },
                ],
                responses: {
                    200: { description: 'List of trending spaces', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/SpaceListItem' } } } } },
                },
            },
        },
        '/spaces/search': {
            get: {
                tags: ['Spaces'],
                summary: 'Search spaces',
                description: 'Search spaces by title or description. Public endpoint.',
                parameters: [
                    { name: 'q', in: 'query', required: true, schema: { type: 'string' }, description: 'Search query' },
                ],
                responses: {
                    200: { description: 'Search results', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/SpaceListItem' } } } } },
                },
            },
        },
        '/spaces/tag/{tag}': {
            get: {
                tags: ['Spaces'],
                summary: 'Search spaces by hashtag',
                description: 'Returns spaces tagged with the given hashtag. Public endpoint.',
                parameters: [
                    { name: 'tag', in: 'path', required: true, schema: { type: 'string' }, description: 'Hashtag to search (without #)' },
                ],
                responses: {
                    200: { description: 'Spaces with this tag', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/SpaceListItem' } } } } },
                },
            },
        },
        '/spaces/recommended': {
            get: {
                tags: ['Spaces'],
                summary: 'Get recommended spaces',
                description: 'Returns recommended spaces for the authenticated user.',
                security: [{ BearerAuth: [] }],
                parameters: [
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Number of spaces to return' },
                ],
                responses: {
                    200: { description: 'Recommended spaces', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/SpaceListItem' } } } } },
                },
            },
        },
        '/spaces/my': {
            get: {
                tags: ['Spaces'],
                summary: 'Get my spaces',
                description: 'Returns all spaces the authenticated user is a member of.',
                security: [{ BearerAuth: [] }],
                parameters: [
                    { name: 'visibility', in: 'query', schema: { type: 'string', enum: ['public', 'private'] }, description: 'Filter by visibility' },
                ],
                responses: {
                    200: { description: 'User\'s spaces', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/SpaceListItem' } } } } },
                },
            },
        },
        '/spaces/{id}': {
            get: {
                tags: ['Spaces'],
                summary: 'Get space by ID',
                description: 'Returns full space details including creator, members, tags, and message count.',
                security: [{ BearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Space ID' },
                ],
                responses: {
                    200: { description: 'Space details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Space' } } } },
                    404: { description: 'Space not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },
        '/spaces/{id}/join': {
            post: {
                tags: ['Spaces'],
                summary: 'Join a space',
                description: 'Join a public space (no invite code needed) or a private space (requires a valid invite code). The code must not be expired or already used.',
                security: [{ BearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
                ],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/JoinSpaceRequest' } } } },
                responses: {
                    200: { description: 'Joined successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessMessage' } } } },
                    400: { description: 'Already a member or invalid code', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                    403: { description: 'Space is locked/archived or invalid invite code', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },
        '/spaces/{id}/invite': {
            post: {
                tags: ['Spaces', 'Invite Codes'],
                summary: 'Generate invite code (creator only)',
                description: 'Generates a single-use invite code for a private space. The code expires in 24 hours. Only the space creator can generate codes.',
                security: [{ BearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
                ],
                responses: {
                    201: {
                        description: 'Invite code generated',
                        content: { 'application/json': { schema: { type: 'object', properties: { code: { type: 'string', example: 'A1B2C3D4' }, expires_at: { type: 'string', format: 'date-time' } } } } },
                    },
                    403: { description: 'Not the creator', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },
        '/spaces/{id}/invite-codes': {
            get: {
                tags: ['Spaces', 'Invite Codes'],
                summary: 'List all invite codes (creator only)',
                description: 'Returns all invite codes for the space with their status (active, used, expired). Only the space creator can view this.',
                security: [{ BearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
                ],
                responses: {
                    200: { description: 'List of invite codes', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/InviteCode' } } } } },
                    403: { description: 'Not the creator', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },
        '/spaces/{id}/members/{userId}': {
            delete: {
                tags: ['Spaces'],
                summary: 'Remove a member (creator only)',
                description: 'Removes a member from the space. Only the space creator can perform this action.',
                security: [{ BearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Space ID' },
                    { name: 'userId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'User ID to remove' },
                ],
                responses: {
                    200: { description: 'Member removed', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessMessage' } } } },
                    403: { description: 'Not the creator', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },
        '/spaces/{id}/lock': {
            put: {
                tags: ['Spaces'],
                summary: 'Toggle space lock (creator only)',
                description: 'Locks or unlocks the space. Locked spaces cannot receive new messages.',
                security: [{ BearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
                ],
                responses: {
                    200: { description: 'Lock toggled', content: { 'application/json': { schema: { type: 'object', properties: { is_locked: { type: 'boolean' } } } } } },
                    403: { description: 'Not the creator', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },
        '/spaces/{id}/archive': {
            put: {
                tags: ['Spaces'],
                summary: 'Archive space (creator only)',
                description: 'Archives the space. Archived spaces cannot be joined or receive messages.',
                security: [{ BearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
                ],
                responses: {
                    200: { description: 'Space archived', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessMessage' } } } },
                    403: { description: 'Not the creator', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },

        // ════════════════════════════════════════
        //  MESSAGES
        // ════════════════════════════════════════
        '/messages/{spaceId}': {
            post: {
                tags: ['Messages'],
                summary: 'Send a message (text or media)',
                description: 'Send a text message, a media message (image/video/audio uploaded to Cloudinary), or both. You must be a member of the space. The space must not be locked or archived. Max file size: 10 MB.',
                security: [{ BearerAuth: [] }],
                parameters: [
                    { name: 'spaceId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                properties: {
                                    content: { type: 'string', description: 'Text content (optional if media is provided)', maxLength: 5000 },
                                    media: { type: 'string', format: 'binary', description: 'Media file (image, video, or audio)' },
                                    media_type: { type: 'string', enum: ['image', 'video', 'audio'], description: 'Auto-detected from file mimetype if not provided' },
                                },
                            },
                        },
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    content: { type: 'string', description: 'Text message content' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: 'Message sent', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
                    400: { description: 'Message must have text or media', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                    403: { description: 'Not a member / space locked or archived', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
            get: {
                tags: ['Messages'],
                summary: 'Get messages for a space',
                description: 'Returns paginated messages for a space. Supports sorting by \'recent\' or \'most_appreciated\'.',
                security: [{ BearerAuth: [] }],
                parameters: [
                    { name: 'spaceId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
                    { name: 'sort', in: 'query', schema: { type: 'string', enum: ['recent', 'most_appreciated'], default: 'recent' } },
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
                ],
                responses: {
                    200: { description: 'Paginated messages', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageListResponse' } } } },
                },
            },
        },
        '/messages/{spaceId}/{messageId}/appreciate': {
            post: {
                tags: ['Messages'],
                summary: 'Toggle appreciation (like) on a message',
                description: 'Likes or unlikes a message. Acts as a toggle.',
                security: [{ BearerAuth: [] }],
                parameters: [
                    { name: 'spaceId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
                    { name: 'messageId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
                ],
                responses: {
                    200: { description: 'Appreciation toggled', content: { 'application/json': { schema: { type: 'object', properties: { appreciated: { type: 'boolean' } } } } } },
                    404: { description: 'Message not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },
        '/messages/{spaceId}/{messageId}': {
            delete: {
                tags: ['Messages'],
                summary: 'Delete a message',
                description: 'Deletes a message. Only the message author or the space creator can delete.',
                security: [{ BearerAuth: [] }],
                parameters: [
                    { name: 'spaceId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
                    { name: 'messageId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
                ],
                responses: {
                    200: { description: 'Message deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessMessage' } } } },
                    403: { description: 'Not authorised', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                    404: { description: 'Message not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },

        // ════════════════════════════════════════
        //  PROFILE
        // ════════════════════════════════════════
        '/profile/me': {
            get: {
                tags: ['Profile'],
                summary: 'Get my profile',
                description: 'Returns the full profile of the authenticated user.',
                security: [{ BearerAuth: [] }],
                responses: {
                    200: { description: 'User profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/UserProfile' } } } },
                },
            },
        },
        '/profile/user/{userId}': {
            get: {
                tags: ['Profile'],
                summary: 'Get public profile',
                description: 'Returns the public profile of another user.',
                security: [{ BearerAuth: [] }],
                parameters: [
                    { name: 'userId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
                ],
                responses: {
                    200: { description: 'Public profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/UserProfile' } } } },
                    404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },
        '/profile/search': {
            get: {
                tags: ['Profile'],
                summary: 'Search users',
                description: 'Search users by username.',
                security: [{ BearerAuth: [] }],
                parameters: [
                    { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search query' },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
                ],
                responses: {
                    200: { description: 'List of matching users', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/UserSummary' } } } } },
                },
            },
        },
        '/profile/username': {
            put: {
                tags: ['Profile'],
                summary: 'Update username',
                security: [{ BearerAuth: [] }],
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['username'], properties: { username: { type: 'string', minLength: 3, maxLength: 50 } } } } } },
                responses: {
                    200: { description: 'Username updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessMessage' } } } },
                    409: { description: 'Username taken', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },
        '/profile/bio': {
            put: {
                tags: ['Profile'],
                summary: 'Update bio',
                security: [{ BearerAuth: [] }],
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['bio'], properties: { bio: { type: 'string', maxLength: 500 } } } } } },
                responses: {
                    200: { description: 'Bio updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessMessage' } } } },
                },
            },
        },
        '/profile/picture': {
            put: {
                tags: ['Profile'],
                summary: 'Upload profile picture',
                description: 'Upload a new profile picture (max 5 MB). Uploaded to Cloudinary.',
                security: [{ BearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                properties: { avatar: { type: 'string', format: 'binary' } },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: 'Picture updated', content: { 'application/json': { schema: { type: 'object', properties: { profile_picture: { type: 'string' } } } } } },
                },
            },
        },
        '/profile/password': {
            put: {
                tags: ['Profile'],
                summary: 'Change password',
                security: [{ BearerAuth: [] }],
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['currentPassword', 'newPassword'], properties: { currentPassword: { type: 'string' }, newPassword: { type: 'string', minLength: 6 } } } } } },
                responses: {
                    200: { description: 'Password changed', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessMessage' } } } },
                    401: { description: 'Current password incorrect', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },
        '/profile/account': {
            delete: {
                tags: ['Profile'],
                summary: 'Delete account',
                description: 'Permanently deletes the authenticated user\'s account and all associated data.',
                security: [{ BearerAuth: [] }],
                responses: {
                    200: { description: 'Account deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessMessage' } } } },
                },
            },
        },

        // ════════════════════════════════════════
        //  NOTIFICATIONS
        // ════════════════════════════════════════
        '/notifications': {
            get: {
                tags: ['Notifications'],
                summary: 'Get notifications',
                description: 'Returns paginated notifications for the authenticated user, including unread count.',
                security: [{ BearerAuth: [] }],
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 30 } },
                ],
                responses: {
                    200: { description: 'Notifications list', content: { 'application/json': { schema: { $ref: '#/components/schemas/NotificationListResponse' } } } },
                },
            },
        },
        '/notifications/{id}/read': {
            put: {
                tags: ['Notifications'],
                summary: 'Mark notification as read',
                security: [{ BearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
                ],
                responses: {
                    200: { description: 'Marked as read', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessMessage' } } } },
                },
            },
        },
        '/notifications/read-all': {
            put: {
                tags: ['Notifications'],
                summary: 'Mark all notifications as read',
                security: [{ BearerAuth: [] }],
                responses: {
                    200: { description: 'All marked as read', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessMessage' } } } },
                },
            },
        },
    },

    tags: [
        { name: 'Health', description: 'Server health check' },
        { name: 'Authentication', description: 'User registration, login, OTP verification, and password reset' },
        { name: 'Spaces', description: 'Create, discover, join, and manage discussion spaces' },
        { name: 'Invite Codes', description: 'Generate and manage invite codes for private spaces' },
        { name: 'Messages', description: 'Send text/media messages, sort, appreciate, and delete' },
        { name: 'Profile', description: 'View and update user profiles' },
        { name: 'Notifications', description: 'View and manage notifications' },
    ],
};

const specs = swaggerJsdoc({
    swaggerDefinition,
    apis: [], // We define everything inline above
});

function setupSwagger(app) {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'space7 API Docs',
    }));
    console.log('📄 Swagger docs available at /api/docs');
}

module.exports = setupSwagger;
