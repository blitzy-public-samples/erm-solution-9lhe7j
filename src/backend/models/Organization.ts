import { Model, DataTypes, Sequelize, Association } from 'sequelize';
import { sequelize } from '../config/database';

interface OrganizationAttributes {
  id: number;
  name: string;
  industry: string;
  subscriptionStart: Date;
  subscriptionEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

class Organization extends Model<OrganizationAttributes> implements OrganizationAttributes {
  public id!: number;
  public name!: string;
  public industry!: string;
  public subscriptionStart!: Date;
  public subscriptionEnd!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Define associations
  public static associate(models: { [key: string]: any }): void {
    // Add associations here, e.g.:
    // Organization.hasMany(models.User, { foreignKey: 'organizationId' });
  }
}

export const initOrganizationModel = (): void => {
  Organization.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      industry: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subscriptionStart: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      subscriptionEnd: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isAfterSubscriptionStart(value: Date) {
            if (value <= this.subscriptionStart) {
              throw new Error('Subscription end date must be after the start date');
            }
          },
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Organization',
      tableName: 'organizations',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['name'],
        },
        {
          fields: ['industry'],
        },
        {
          fields: ['subscriptionEnd'],
        },
      ],
    }
  );
};

export default Organization;