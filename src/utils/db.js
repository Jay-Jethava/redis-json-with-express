const Sequelize = require("sequelize");
const dbConfig = require("../configs/db-config.js");
console.log(dbConfig[process.env.NODE_ENV]);

const sequelize = new Sequelize(dbConfig[process.env.NODE_ENV]);

sequelize
  .sync({ alter: true })
  .then(async (result) => {
    console.log(`✔ Database connected successfully.`);
  })
  .catch((err) => {
    console.error(err);
  });

module.exports = sequelize;
