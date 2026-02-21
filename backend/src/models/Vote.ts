import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface VoteAttributes {
  id: number;
  pollId: number;
  userId: number;
  optionIndex: number;
  transactionSignature: string;
  walletAddress: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface VoteCreationAttributes extends Optional<VoteAttributes, 'id'> {}

class Vote extends Model<VoteAttributes, VoteCreationAttributes> implements VoteAttributes {
  public id!: number;
  public pollId!: number;
  public userId!: number;
  public optionIndex!: number;
  public transactionSignature!: string;
  public walletAddress!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Vote.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    pollId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'polls',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    optionIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    transactionSignature: {
      type: DataTypes.STRING(88),
      allowNull: false,
      unique: true,
    },
    walletAddress: {
      type: DataTypes.STRING(44),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'votes',
  }
);

export default Vote;
