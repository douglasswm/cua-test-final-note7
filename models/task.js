/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('task', {
    taskid: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    taskname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    listid: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    taskStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '0'
    }
  }, {
    tableName: 'task'
  });
};
