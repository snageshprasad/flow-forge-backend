module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define(
    "Task",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 200],
          notEmpty: true,
        },
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      board_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "boards",
          key: "id",
        },
      },

      status_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "statuses",
          key: "id",
        },
      },

      priority: {
        type: DataTypes.ENUM("low", "medium", "high", "urgent"),
        allowNull: false,
        defaultValue: "medium",
      },

      position: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      due_date: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isDate: true,
          // NOTE: isAfter evaluated per-request here, not at server start
          isAfterNow(value) {
            if (value && new Date(value) <= new Date()) {
              throw new Error("Due date must be in the future.");
            }
          },
        },
      },

      created_by: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      tableName: "tasks",
      timestamps: true,
      paranoid: true, // adds deleted_at, soft delete — keeps activity logs intact
      underscored: true,
      indexes: [
        {
          fields: ["board_id"],
        },
        {
          fields: ["status_id"],
        },
        {
          fields: ["status_id", "position"],
        },
      ],
    },
  );

  Task.associate = (models) => {
    Task.belongsTo(models.Board, {
      foreignKey: "board_id",
      as: "board",
    });

    Task.belongsTo(models.Status, {
      foreignKey: "status_id",
      as: "status",
    });

    Task.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator",
    });

    Task.hasMany(models.TaskAssignee, {
      foreignKey: "task_id",
      as: "assignees",
    });

    Task.hasMany(models.Comment, {
      foreignKey: "task_id",
      as: "comments",
    });

    Task.hasMany(models.Activity, {
      foreignKey: "task_id",
      as: "activities",
    });
  };

  return Task;
};
