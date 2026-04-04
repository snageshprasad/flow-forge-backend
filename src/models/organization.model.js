module.exports = (sequelize, DataTypes) => {
  const Organization = sequelize.define(
    "Organization",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [2, 100],
          notEmpty: true,
        },
      },

      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      logo_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      owner_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      tableName: "organizations",
      timestamps: true,
      paranoid: true, // adds deleted_at, soft delete
      underscored: true,
    },
  );

  Organization.associate = (models) => {
    Organization.belongsTo(models.User, {
      foreignKey: "owner_id",
      as: "owner",
    });

    Organization.hasMany(models.OrganizationMember, {
      foreignKey: "organization_id",
      as: "members",
    });

    Organization.hasMany(models.Board, {
      foreignKey: "organization_id",
      as: "boards",
    });

    Organization.hasMany(models.Invite, {
      foreignKey: "organization_id",
      as: "invites",
    });
  };

  return Organization;
};
