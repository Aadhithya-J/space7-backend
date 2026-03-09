const notificationService = require('../services/notificationService');

class NotificationController {
    async list(req, res, next) {
        try {
            const result = await notificationService.getNotifications(req.user.user_id, {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 30,
            });
            res.json(result);
        } catch (err) { next(err); }
    }

    async markRead(req, res, next) {
        try {
            const result = await notificationService.markAsRead(req.params.id, req.user.user_id);
            res.json(result);
        } catch (err) { next(err); }
    }

    async markAllRead(req, res, next) {
        try {
            const result = await notificationService.markAllAsRead(req.user.user_id);
            res.json(result);
        } catch (err) { next(err); }
    }
}

module.exports = new NotificationController();
