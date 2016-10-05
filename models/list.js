/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('list', {
    listid: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    listname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    groupid: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    }
  }, {
    tableName: 'list'
  });
};
