const sequelize = require('../config/database');
const User = require('./user');
const Space = require('./space');
const SpaceMember = require('./spaceMember');
const Message = require('./message');
const MessageLike = require('./messageLike');
const Tag = require('./tag');
const SpaceTag = require('./spaceTag');
const InviteCode = require('./inviteCode');
const Notification = require('./notification');

// ── User ↔ Space (creator) ──
User.hasMany(Space, { foreignKey: 'creator_id', as: 'createdSpaces' });
Space.belongsTo(User, { foreignKey: 'creator_id', as: 'creator' });

// ── Space ↔ SpaceMember ↔ User ──
Space.hasMany(SpaceMember, { foreignKey: 'space_id', as: 'members' });
SpaceMember.belongsTo(Space, { foreignKey: 'space_id' });

User.hasMany(SpaceMember, { foreignKey: 'user_id', as: 'memberships' });
SpaceMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ── Space ↔ Message ──
Space.hasMany(Message, { foreignKey: 'space_id', as: 'messages' });
Message.belongsTo(Space, { foreignKey: 'space_id' });

// ── User ↔ Message ──
User.hasMany(Message, { foreignKey: 'sender_id', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// ── Message ↔ MessageLike ──
Message.hasMany(MessageLike, { foreignKey: 'message_id', as: 'likes' });
MessageLike.belongsTo(Message, { foreignKey: 'message_id' });

User.hasMany(MessageLike, { foreignKey: 'user_id', as: 'appreciations' });
MessageLike.belongsTo(User, { foreignKey: 'user_id' });

// ── Space ↔ Tag (many-to-many through SpaceTag) ──
Space.belongsToMany(Tag, { through: SpaceTag, foreignKey: 'space_id', otherKey: 'tag_id', as: 'tags' });
Tag.belongsToMany(Space, { through: SpaceTag, foreignKey: 'tag_id', otherKey: 'space_id', as: 'spaces' });

// ── Space ↔ InviteCode ──
Space.hasMany(InviteCode, { foreignKey: 'space_id', as: 'inviteCodes' });
InviteCode.belongsTo(Space, { foreignKey: 'space_id' });

// ── User ↔ Notification ──
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// ── InviteCode ↔ User (used_by) ──
InviteCode.belongsTo(User, { foreignKey: 'used_by', as: 'usedByUser', constraints: false });

const models = {
    User,
    Space,
    SpaceMember,
    Message,
    MessageLike,
    Tag,
    SpaceTag,
    InviteCode,
    Notification,
};

module.exports = { sequelize, ...models };
