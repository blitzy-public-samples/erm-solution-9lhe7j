import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { RiskStatus } from '../../shared/types/index';

interface RiskAttributes {
  id: number;
  organizationId: number;
  ownerId: number;
  categoryId: number;
  title: string;
  description: string;
  status: RiskStatus;
  createdAt: Date;
  updatedAt: Date;
}

class Risk extends Model<RiskAttributes> implements RiskAttributes {
  public id!: number;
  public organizationId!: number;
  public ownerId!: number;
  public categoryId!: number;
  public title!: string;
  public description!: string;
  public status!: RiskStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: { [key: string]: any }): void {
    // Define associations here
    Risk.belongsTo(models.Organization, { foreignKey: 'organizationId' });
    Risk.belongsTo(models.User, { foreignKey: 'ownerId', as: 'owner' });
    Risk.belongsTo(models.RiskCategory, { foreignKey: 'categoryId' });
    Risk.hasMany(models.Assessment, { foreignKey: 'riskId' });
    Risk.hasMany(models.MitigationAction, { foreignKey: 'riskId' });
  }
}

export const initRiskModel = (): void => {
  Risk.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: [1, 255],
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(RiskStatus)),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'risks',
      timestamps: true,
      indexes: [
        { fields: ['organizationId'] },
        { fields: ['ownerId'] },
        { fields: ['categoryId'] },
        { fields: ['status'] },
      ],
    }
  );
};

export default Risk;