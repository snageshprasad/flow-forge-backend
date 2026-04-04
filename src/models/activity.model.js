module.exports = (sequelize, DataTypes) => {
  const Activity = sequelize.define(
    "Activity",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      board_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "boards",
          key: "id",
        },
      },

      task_id: {
        type: DataTypes.UUID,
        allowNull: true,
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

      action: {
        type: DataTypes.ENUM(
          "TASK_CREATED",
          "TASK_UPDATED",
          "TASK_MOVED",
          "TASK_ASSIGNED",
          "TASK_UNASSIGNED",
          "TASK_DELETED",
          "BOARD_CREATED",
          "BOARD_UPDATED",
          "STATUS_CREATED",
          "STATUS_UPDATED",
          "STATUS_DELETED",
          "MEMBER_ADDED",
          "MEMBER_REMOVED",
          "COMMENT_ADDED",
          "COMMENT_DELETED",
          "INVITE_SENT",
          "INVITE_ACCEPTED",
        ),
        allowNull: false,
      },

      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      tableName: "activities",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ["board_id"],
        },
        {
          fields: ["task_id"],
        },
        {
          fields: ["user_id"],
        },
      ],
    },
  );

  Activity.associate = (models) => {
    Activity.belongsTo(models.Board, {
      foreignKey: "board_id",
      as: "board",
    });

    Activity.belongsTo(models.Task, {
      foreignKey: "task_id",
      as: "task",
    });

    Activity.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return Activity;
};
