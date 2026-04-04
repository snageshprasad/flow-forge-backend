module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define(
    "Comment",
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

      // null = top-level comment, set = reply to another comment
      parent_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "comments",
          key: "id",
        },
      },

      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 5000],
        },
      },

      // track if edited after posting
      is_edited: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "comments",
      timestamps: true,
      paranoid: true, // soft delete — parent comment can't vanish and break thread
      underscored: true,
      indexes: [
        {
          fields: ["task_id"],
        },
        {
          fields: ["parent_id"], // fast fetch of replies
        },
        {
          fields: ["user_id"],
        },
      ],
    },
  );

  Comment.associate = (models) => {
    Comment.belongsTo(models.Task, {
      foreignKey: "task_id",
      as: "task",
    });

    Comment.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "author",
    });

    // self-referential: parent comment
    Comment.belongsTo(models.Comment, {
      foreignKey: "parent_id",
      as: "parent",
    });

    // self-referential: child replies
    Comment.hasMany(models.Comment, {
      foreignKey: "parent_id",
      as: "replies",
    });
  };

  return Comment;
};
