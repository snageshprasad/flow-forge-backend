module.exports = (sequelize, DataTypes) => {
  const Status = sequelize.define(
    "Status",
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

      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 50],
          notEmpty: true,
        },
      },

      color: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: /^#[0-9a-fA-F]{6}$/,
        },
      },

      position: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      // marks "done" column — used to determine task completion
      is_terminal: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "statuses",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ["board_id"],
        },
        {
          fields: ["board_id", "position"],
        },
      ],
    },
  );

  Status.associate = (models) => {
    Status.belongsTo(models.Board, {
      foreignKey: "board_id",
      as: "board",
    });

    Status.hasMany(models.Task, {
      foreignKey: "status_id",
      as: "tasks",
    });
  };

  return Status;
};
