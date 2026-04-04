module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      user_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          is: /^[a-z0-9_]+$/,
          len: [3, 30],
          notEmpty: true,
        },
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      avatar_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "users",
      timestamps: true,
      paranoid: true, // adds deleted_at, soft delete
      underscored: true,
    },
  );

  User.associate = (models) => {
    User.hasMany(models.Organization, {
      foreignKey: "owner_id",
      as: "ownedOrganizations",
    });

    User.hasMany(models.OrganizationMember, {
      foreignKey: "user_id",
      as: "memberships",
    });

    User.hasMany(models.BoardMember, {
      foreignKey: "user_id",
      as: "boardMemberships",
    });

    User.hasMany(models.Board, {
      foreignKey: "created_by",
      as: "createdBoards",
    });

    User.hasMany(models.TaskAssignee, {
      foreignKey: "user_id",
      as: "assignedTasks",
    });

    User.hasMany(models.Activity, {
      foreignKey: "user_id",
      as: "activities",
    });

    User.hasMany(models.Comment, {
      foreignKey: "user_id",
      as: "comments",
    });

    User.hasMany(models.Invite, {
      foreignKey: "invited_by",
      as: "sentInvites",
    });
  };

  return User;
};
