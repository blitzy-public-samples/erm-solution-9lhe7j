import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface RiskCategoryAttributes {
  id: number;
  organizationId: number;
  name: string;
  parentCategoryId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

class RiskCategory extends Model<RiskCategoryAttributes> implements RiskCategoryAttributes {
  public id!: number;
  public organizationId!: number;
  public name!: string;
  public parentCategoryId!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: { [key: string]: any }): void {
    // Define associations here
    RiskCategory.belongsTo(models.Organization, { foreignKey: 'organizationId' });
    RiskCategory.belongsTo(RiskCategory, { as: 'parentCategory', foreignKey: 'parentCategoryId' });
    RiskCategory.hasMany(RiskCategory, { as: 'childCategories', foreignKey: 'parentCategoryId' });
    RiskCategory.hasMany(models.Risk, { foreignKey: 'categoryId' });
  }
}

const initRiskCategoryModel = (): void => {
  RiskCategory.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'organizations',
          key: 'id',
        },
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      parentCategoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'risk_categories',
          key: 'id',
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
      tableName: 'risk_categories',
      indexes: [
        {
          unique: true,
          fields: ['organizationId', 'name'],
          name: 'unique_org_category_name',
        },
        {
          fields: ['parentCategoryId'],
        },
      ],
    }
  );
};

export { RiskCategory, initRiskCategoryModel };