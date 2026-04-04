module.exports = (sequelize, DataTypes) => {
  const BoardMember = sequelize.define(
    "BoardMember",
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

      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },

      // Board-level role — can override or narrow org-level role
      // e.g. an org "member" can be a board "admin" for a specific board
      role: {
        type: DataTypes.ENUM("admin", "member", "viewer"),
        allowNull: false,
        defaultValue: "member",
      },

      added_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "board_members",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["board_id", "user_id"], // prevent duplicate board membership
        },
        {
          fields: ["user_id"], // fast lookup of all boards a user is on
        },
      ],
    },
  );

  BoardMember.associate = (models) => {
    BoardMember.belongsTo(models.Board, {
      foreignKey: "board_id",
      as: "board",
    });

    BoardMember.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return BoardMember;
};
