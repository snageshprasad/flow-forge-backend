module.exports = (sequelize, DataTypes) => {
  const OrganizationMember = sequelize.define(
    "OrganizationMember",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      organization_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "organizations",
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

      role: {
        type: DataTypes.ENUM("owner", "admin", "member", "viewer"),
        allowNull: false,
        defaultValue: "member",
      },

      joined_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "organization_members",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["organization_id", "user_id"],
        },
      ],
    },
  );

  OrganizationMember.associate = (models) => {
    OrganizationMember.belongsTo(models.Organization, {
      foreignKey: "organization_id",
      as: "organization",
    });

    OrganizationMember.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return OrganizationMember;
};
