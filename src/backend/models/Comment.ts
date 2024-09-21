import { Model, DataTypes } from 'sequelize';
import sequelize from 'src/backend/config/database';

interface CommentAttributes {
  id: number;
  riskId: number;
  userId: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

class Comment extends Model<CommentAttributes> implements CommentAttributes {
  public id!: number;
  public riskId!: number;
  public userId!: number;
  public content!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: { [key: string]: any }): void {
    Comment.belongsTo(models.Risk, { foreignKey: 'riskId', as: 'risk' });
    Comment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }
}

export const initCommentModel = (): void => {
  Comment.init(
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
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 1000], // Example content length limit
        },
      },
    },
    {
      sequelize,
      modelName: 'Comment',
      tableName: 'comments',
      indexes: [
        { fields: ['riskId'] },
        { fields: ['userId'] },
        { fields: ['createdAt'] },
      ],
    }
  );
};

export default Comment;