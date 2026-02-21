import User from './User';
import Poll from './Poll';
import Option from './Option';
import Vote from './Vote';

// Define associations
User.hasMany(Poll, { foreignKey: 'creatorId', as: 'polls' });
Poll.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

Poll.hasMany(Option, { foreignKey: 'pollId', as: 'options' });
Option.belongsTo(Poll, { foreignKey: 'pollId', as: 'poll' });

Poll.hasMany(Vote, { foreignKey: 'pollId', as: 'votes' });
Vote.belongsTo(Poll, { foreignKey: 'pollId', as: 'poll' });

User.hasMany(Vote, { foreignKey: 'userId', as: 'votes' });
Vote.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { User, Poll, Option, Vote };
