const profileService = require('../services/profileService');

class ProfileController {
    async getProfile(req, res, next) {
        try {
            const profile = await profileService.getProfile(req.user.user_id);
            res.json(profile);
        } catch (err) { next(err); }
    }

    async getPublicProfile(req, res, next) {
        try {
            const profile = await profileService.getPublicProfile(req.params.userId);
            res.json(profile);
        } catch (err) { next(err); }
    }

    async searchUsers(req, res, next) {
        try {
            const users = await profileService.searchUsers(req.query.q || '', parseInt(req.query.limit) || 20);
            res.json(users);
        } catch (err) { next(err); }
    }

    async updateUsername(req, res, next) {
        try {
            const result = await profileService.updateUsername(req.user.user_id, req.body.username);
            res.json(result);
        } catch (err) { next(err); }
    }

    async updateBio(req, res, next) {
        try {
            const result = await profileService.updateBio(req.user.user_id, req.body.bio);
            res.json(result);
        } catch (err) { next(err); }
    }

    async updateProfilePicture(req, res, next) {
        try {
            const result = await profileService.updateProfilePicture(req.user.user_id, req.file);
            res.json(result);
        } catch (err) { next(err); }
    }

    async changePassword(req, res, next) {
        try {
            const result = await profileService.changePassword(
                req.user.user_id,
                req.body.currentPassword,
                req.body.newPassword
            );
            res.json(result);
        } catch (err) { next(err); }
    }

    async deleteAccount(req, res, next) {
        try {
            const result = await profileService.deleteAccount(req.user.user_id);
            res.json(result);
        } catch (err) { next(err); }
    }
}

module.exports = new ProfileController();
