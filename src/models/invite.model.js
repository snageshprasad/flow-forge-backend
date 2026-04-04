const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  const Invite = sequelize.define(
    "Invite",
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

      invited_by: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },

      // email the invite was sent to
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },

      // role to grant upon acceptance
      role: {
        type: DataTypes.ENUM("admin", "member", "viewer"),
        allowNull: false,
        defaultValue: "member",
      },

      // secure random token sent in invite link
      token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        defaultValue: () =>
          uuidv4().replace(/-/g, "") + uuidv4().replace(/-/g, ""), // 64 char token
      },

      status: {
        type: DataTypes.ENUM("pending", "accepted", "expired", "cancelled"),
        allowNull: false,
        defaultValue: "pending",
      },

      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: () => {
          const d = new Date();
          d.setDate(d.getDate() + 7); // 7 days expiry by default
          return d;
        },
      },

      // set when invite is accepted
      accepted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "invites",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["token"],
        },
        {
          fields: ["organization_id"],
        },
        {
          fields: ["email"],
        },
        {
          // prevent duplicate pending invites to same email in same org
          unique: true,
          fields: ["organization_id", "email"],
          where: {
            status: "pending",
          },
        },
      ],
    },
  );

  Invite.associate = (models) => {
    Invite.belongsTo(models.Organization, {
      foreignKey: "organization_id",
      as: "organization",
    });

    Invite.belongsTo(models.User, {
      foreignKey: "invited_by",
      as: "inviter",
    });
  };

  return Invite;
};
