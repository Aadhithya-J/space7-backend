const { Notification } = require('../models');

class NotificationService {
    async getNotifications(userId, { page = 1, limit = 30 }) {
        const offset = (page - 1) * limit;
        const { count, rows } = await Notification.findAndCountAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']],
            limit,
            offset,
        });

        return {
            notifications: rows,
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
            unreadCount: await Notification.count({ where: { user_id: userId, is_read: false } }),
        };
    }

    async markAsRead(notificationId, userId) {
        const notification = await Notification.findOne({
            where: { notification_id: notificationId, user_id: userId },
        });
        if (!notification) throw Object.assign(new Error('Notification not found'), { status: 404 });

        notification.is_read = true;
        await notification.save();
        return { message: 'Marked as read' };
    }

    async markAllAsRead(userId) {
        await Notification.update({ is_read: true }, { where: { user_id: userId, is_read: false } });
        return { message: 'All notifications marked as read' };
    }
}

module.exports = new NotificationService();
