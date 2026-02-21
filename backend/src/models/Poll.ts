import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PollAttributes {
  id: number;
  pollId: string;
  title: string;
  description: string;
  creatorId: number;
  blockchainAddress: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'active' | 'closed';
  createdAt?: Date;
  updatedAt?: Date;
}

interface PollCreationAttributes extends Optional<PollAttributes, 'id'> {}

class Poll extends Model<PollAttributes, PollCreationAttributes> implements PollAttributes {
  public id!: number;
  public pollId!: string;
  public title!: string;
  public description!: string;
  public creatorId!: number;
  public blockchainAddress!: string;
  public startTime!: Date;
  public endTime!: Date;
  public status!: 'pending' | 'active' | 'closed';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Poll.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    pollId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    creatorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    blockchainAddress: {
      type: DataTypes.STRING(44),
      allowNull: false,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'closed'),
      defaultValue: 'pending',
    },
  },
  {
    sequelize,
    tableName: 'polls',
  }
);

export default Poll;
