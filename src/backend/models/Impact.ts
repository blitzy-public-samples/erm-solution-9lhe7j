import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from 'src/backend/config/database';

interface ImpactAttributes {
  id: number;
  level: string;
  score: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

class Impact extends Model<ImpactAttributes> implements ImpactAttributes {
  public id!: number;
  public level!: string;
  public score!: number;
  public description!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: { [key: string]: any }): void {
    // Define associations here
  }
}

const initImpactModel = (): void => {
  Impact.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      level: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'uniqueLevelScore',
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: 'uniqueLevelScore',
        validate: {
          min: 1,
          max: 10, // Assuming a scale of 1-10, adjust as needed
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
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
      modelName: 'Impact',
      tableName: 'impacts',
      indexes: [
        {
          unique: true,
          fields: ['level', 'score'],
          name: 'uniqueLevelScore',
        },
        {
          fields: ['score'],
        },
      ],
    }
  );
};

export { Impact, initImpactModel };