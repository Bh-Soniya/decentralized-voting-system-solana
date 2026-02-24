import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';

interface VoterAttributes {
  id: number;
  voterId: string;
  username: string;
  email: string;
  password: string;
  citizenshipNumber: string;
  citizenshipHash: string;
  issueDate: Date;
  walletAddress: string;
  role: 'voter';
  isEligible: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface VoterCreationAttributes extends Optional<VoterAttributes, 'id' | 'voterId' | 'isEligible' | 'citizenshipHash'> {}

class Voter extends Model<VoterAttributes, VoterCreationAttributes> implements VoterAttributes {
  public id!: number;
  public voterId!: string;
  public username!: string;
  public email!: string;
  public password!: string;
  public citizenshipNumber!: string;
  public citizenshipHash!: string;
  public issueDate!: Date;
  public walletAddress!: string;
  public role!: 'voter';
  public isEligible!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  public async compareCitizenship(candidateCitizenship: string): Promise<boolean> {
    return bcrypt.compare(candidateCitizenship, this.citizenshipHash);
  }
}

Voter.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    voterId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    citizenshipNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        is: /^[0-9]{5,20}$/,
      },
    },
    citizenshipHash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    issueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    walletAddress: {
      type: DataTypes.STRING(44),
      allowNull: false,
      unique: true,
    },
    role: {
      type: DataTypes.ENUM('voter'),
      allowNull: false,
      defaultValue: 'voter',
    },
    isEligible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'voters',
    hooks: {
      beforeValidate: async (voter: Voter) => {
        if (!voter.voterId) {
          const date = new Date();
          const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
          const random = Math.random().toString(36).substring(2, 7).toUpperCase();
          voter.voterId = `VID-${dateStr}-${random}`;
        }
        // Hash citizenship number before validation
        if (voter.citizenshipNumber && !voter.citizenshipHash) {
          const salt = await bcrypt.genSalt(10);
          voter.citizenshipHash = await bcrypt.hash(voter.citizenshipNumber, salt);
        }
      },
      beforeCreate: async (voter: Voter) => {
        if (voter.password) {
          const salt = await bcrypt.genSalt(10);
          voter.password = await bcrypt.hash(voter.password, salt);
        }
      },
      beforeUpdate: async (voter: Voter) => {
        if (voter.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          voter.password = await bcrypt.hash(voter.password, salt);
        }
      },
    },
  }
);

export default Voter;
