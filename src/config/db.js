const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");

console.log(
  "Connecting to DB:",
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_HOST,
  process.env.DB_PORT,
);

// ✅ Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false,

    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },

    define: {
      timestamps: true,
      underscored: true,
    },
  },
);

const db = {};

// 📂 Dynamically load all models
const modelsPath = path.join(__dirname, "../models");

fs.readdirSync(modelsPath)
  .filter((file) => file.endsWith(".model.js"))
  .forEach((file) => {
    const model = require(path.join(modelsPath, file))(
      sequelize,
      Sequelize.DataTypes,
    );
    db[model.name] = model;
  });

// 🔗 Setup associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// ✅ Test DB connection
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected");

    // 🚫 Sync disabled by default (safe mode)
    // return sequelize.sync({ alter: true });
  })

  // .then(() => {
  //   console.log("✅ Models synchronized with DB");
  // })
  
  .catch((err) => {
    console.error("❌ Unable to connect to DB:", err);
  });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
