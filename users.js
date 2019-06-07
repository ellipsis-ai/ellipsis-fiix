module.exports = (ellipsis) => {
  const client = require('./sdk')(ellipsis);

  function getUserIdForEmail(email) {
    if (!email) {
      return Promise.resolve(null);
    }
    return new Promise((resolve, reject) => {
      return client.find({
        "className": "User",
        "fields": "id",
        "filters": [{
          "ql": "strEmailAddress = ?", "parameters": [email]
        }],
        "callback": function (ret) {
          const id = ret.objects[0] ? ret.objects[0].id : null;
          if (!ret.error) {
            resolve(id);
          } else {
            reject(ret.error);
          }
        }
      });
    });
  }

  function getAllActive() {
    return new Promise((resolve, reject) => {
      return client.find({
        "className": "User",
        "fields": "id, strFullName, strEmailAddress",
        "filters": [{
          "ql": "intUserStatusID = ?", "parameters": [1]
        }],
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

  return {
    userIdForEmail: getUserIdForEmail,
    getAllActive: getAllActive
  };
};
