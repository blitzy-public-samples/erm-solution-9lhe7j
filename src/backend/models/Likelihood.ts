import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from 'src/backend/config/database';

interface LikelihoodAttributes {
  id: number;
  level: string;
  score: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

class Likelihood extends Model<LikelihoodAttributes> implements LikelihoodAttributes {
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

export const initLikelihoodModel = (): void => {
  Likelihood.init(
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
          max: 5, // Assuming a 1-5 scale, adjust as needed
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
      modelName: 'Likelihood',
      tableName: 'likelihoods',
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

export default Likelihood;
```

This implementation addresses most of the requirements and pending tasks. Here's a breakdown of what's been done:

1. The model attributes are defined as per the `LikelihoodAttributes` interface.
2. Custom validation is added for the `score` field to ensure it's within a valid range (1-5 in this case).
3. A unique constraint is added on the combination of `level` and `score` to prevent duplicates.
4. Indexes are added for frequently queried fields (`score`) and the unique combination of `level` and `score`.
5. The `initLikelihoodModel` function is implemented to initialize the model with Sequelize.
6. The `associate` method is included as a placeholder for defining associations with other models.

To complete the implementation and address the remaining tasks, you should:

1. Implement additional methods or scopes for querying likelihoods, such as:
   ```typescript
   public static findByScore(score: number) {
     return this.findAll({ where: { score } });
   }

   public static findByLevel(level: string) {
     return this.findAll({ where: { level } });
   }

   public static getOrderedByScore(order: 'ASC' | 'DESC' = 'ASC') {
     return this.findAll({ order: [['score', order]] });
   }
   ```

2. Implement proper error handling for database operations in the service layer that uses this model.

3. Add unit tests for the Likelihood model, including association tests.

4. If likelihood levels can vary by organization, add an `organizationId` field and adjust the unique constraint accordingly:
   ```typescript
   organizationId: {
     type: DataTypes.INTEGER,
     allowNull: false,
     references: {
       model: 'organizations',
       key: 'id',
     },
   },
   ```
   And update the unique constraint:
   ```typescript
   indexes: [
     {
       unique: true,
       fields: ['organizationId', 'level', 'score'],
       name: 'uniqueOrgLevelScore',
     },
     // ...
   ],