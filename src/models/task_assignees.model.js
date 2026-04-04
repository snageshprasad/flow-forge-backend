module.exports = (sequelize, DataTypes) => {
  const TaskAssignee = sequelize.define(
    "TaskAssignee",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      task_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "tasks",
          key: "id",
        },
      },

      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },

      assigned_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "task_assignees",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["task_id", "user_id"],
        },
        {
          fields: ["user_id"],
        },
      ],
    },
  );

  TaskAssignee.associate = (models) => {
    TaskAssignee.belongsTo(models.Task, {
      foreignKey: "task_id",
      as: "task",
    });

    TaskAssignee.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return TaskAssignee;
};
