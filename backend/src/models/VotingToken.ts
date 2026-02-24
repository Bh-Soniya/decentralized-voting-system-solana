import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface VotingTokenAttributes {
  id: number;
  tokenId: string;
  voterId: number;
  voterWalletAddress: string;
  pollId: number;
  status: 'minted' | 'used' | 'collected';
  mintedBy: number; // Admin ID
  mintTransactionSignature: string;
  transferTransactionSignature?: string;
  mintedAt: Date;
  usedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface VotingTokenCreationAttributes extends Optional<VotingTokenAttributes, 'id' | 'transferTransactionSignature' | 'usedAt'> {}

class VotingToken extends Model<VotingTokenAttributes, VotingTokenCreationAttributes> implements VotingTokenAttributes {
  public id!: number;
  public tokenId!: string;
  public voterId!: number;
  public voterWalletAddress!: string;
  public pollId!: number;
  public status!: 'minted' | 'used' | 'collected';
  public mintedBy!: number;
  public mintTransactionSignature!: string;
  public transferTransactionSignature?: string;
  public mintedAt!: Date;
  public usedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

VotingToken.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    tokenId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    voterId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'voters',
        key: 'id',
      },
    },
    voterWalletAddress: {
      type: DataTypes.STRING(44),
      allowNull: false,
    },
    pollId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'polls',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('minted', 'used', 'collected'),
      allowNull: false,
      defaultValue: 'minted',
    },
    mintedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    mintTransactionSignature: {
      type: DataTypes.STRING(88),
      allowNull: false,
    },
    transferTransactionSignature: {
      type: DataTypes.STRING(88),
      allowNull: true,
    },
    mintedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'voting_tokens',
  }
);

export default VotingToken;
