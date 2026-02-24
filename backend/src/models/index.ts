import User from './User';
import Voter from './Voter';
import Poll from './Poll';
import Option from './Option';
import Vote from './Vote';
import VotingToken from './VotingToken';

// Define associations
User.hasMany(Poll, { foreignKey: 'creatorId', as: 'polls' });
Poll.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

Poll.hasMany(Option, { foreignKey: 'pollId', as: 'options' });
Option.belongsTo(Poll, { foreignKey: 'pollId', as: 'poll' });

Poll.hasMany(Vote, { foreignKey: 'pollId', as: 'votes' });
Vote.belongsTo(Poll, { foreignKey: 'pollId', as: 'poll' });

User.hasMany(Vote, { foreignKey: 'userId', as: 'votes' });
Vote.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Voting Token associations
Voter.hasMany(VotingToken, { foreignKey: 'voterId', as: 'tokens' });
VotingToken.belongsTo(Voter, { foreignKey: 'voterId', as: 'voter' });

Poll.hasMany(VotingToken, { foreignKey: 'pollId', as: 'tokens' });
VotingToken.belongsTo(Poll, { foreignKey: 'pollId', as: 'poll' });

User.hasMany(VotingToken, { foreignKey: 'mintedBy', as: 'mintedTokens' });
VotingToken.belongsTo(User, { foreignKey: 'mintedBy', as: 'minter' });

export { User, Voter, Poll, Option, Vote, VotingToken };
