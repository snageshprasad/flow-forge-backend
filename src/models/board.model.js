module.exports = (sequelize, DataTypes) => {
  const Board = sequelize.define(
    "Board",
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
          len: [2, 100],
          notEmpty: true,
        },
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      color: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: /^#[0-9a-fA-F]{6}$/,
        },
      },

      organization_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "organizations",
          key: "id",
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
      tableName: "boards",
      timestamps: true,
      paranoid: true, // adds deleted_at, soft delete (archive boards)
      underscored: true,
    },
  );

  Board.associate = (models) => {
    Board.belongsTo(models.Organization, {
      foreignKey: "organization_id",
      as: "organization",
    });

    Board.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator",
    });

    Board.hasMany(models.BoardMember, {
      foreignKey: "board_id",
      as: "members",
    });

    Board.hasMany(models.Status, {
      foreignKey: "board_id",
      as: "statuses",
    });

    Board.hasMany(models.Task, {
      foreignKey: "board_id",
      as: "tasks",
    });

    Board.hasMany(models.Activity, {
      foreignKey: "board_id",
      as: "activities",
    });
  };

  return Board;
};
