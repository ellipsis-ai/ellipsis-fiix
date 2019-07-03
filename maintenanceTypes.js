module.exports = (ellipsis) => {
  const client = require('./sdk')(ellipsis);

  return {
    getAll: getAll
  };

  function getAll() {
    return new Promise((resolve, reject) => {
      return client.find({
        "className": "MaintenanceType",
        "fields": "id, strName, intSysCode",
        "filters": [],
        callback: function (ret) {
          if (!ret.error) {
            resolve(ret.objects);
          } else {
            reject(ret.error);
          }
        }
      });
    });
  }
};
