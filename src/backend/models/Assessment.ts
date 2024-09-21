import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/database';

interface AssessmentAttributes {
  id: number;
  riskId: number;
  likelihoodId: number;
  impactId: number;
  assessmentDate: Date;
  assessorId: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

class Assessment extends Model<AssessmentAttributes> implements AssessmentAttributes {
  public id!: number;
  public riskId!: number;
  public likelihoodId!: number;
  public impactId!: number;
  public assessmentDate!: Date;
  public assessorId!: number;
  public notes!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: { [key: string]: any }): void {
    Assessment.belongsTo(models.Risk, { foreignKey: 'riskId' });
    Assessment.belongsTo(models.Likelihood, { foreignKey: 'likelihoodId' });
    Assessment.belongsTo(models.Impact, { foreignKey: 'impactId' });
    Assessment.belongsTo(models.User, { foreignKey: 'assessorId', as: 'assessor' });
  }

  public static calculateRiskScore(): number {
    // TODO: Implement risk score calculation based on likelihood and impact
    return 0;
  }
}

const initAssessmentModel = (): void => {
  Assessment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      riskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'risks',
          key: 'id',
        },
      },
      likelihoodId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'likelihoods',
          key: 'id',
        },
      },
      impactId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'impacts',
          key: 'id',
        },
      },
      assessmentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: true,
          isBefore: new Date().toISOString(),
        },
      },
      assessorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Assessment',
      tableName: 'assessments',
      indexes: [
        { fields: ['riskId'] },
        { fields: ['likelihoodId'] },
        { fields: ['impactId'] },
        { fields: ['assessorId'] },
        { fields: ['assessmentDate'] },
      ],
      hooks: {
        afterCreate: async (assessment: Assessment, options) => {
          // TODO: Implement logic to update associated Risk's status
        },
      },
    }
  );
};

export { Assessment, initAssessmentModel };