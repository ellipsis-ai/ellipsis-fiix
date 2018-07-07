"use strict";

const fs = require('fs');

module.exports = ellipsis => {
  const client = require('./sdk')(ellipsis);

  return {
    createLink: createLink,
  };

  function createLink(filename, link, workOrderId) {
    return new Promise((resolve, reject) => {
      client.add({
        "className" : "File",
        "fields": "id",
        "object" : {
          "intWorkOrderID" : parseInt(workOrderId.toString()),
          "intFileTypeID" : 1,
          "strName" : filename,
          "strLink" : link
        },
        "callback": function(ret) {
          if (!ret.error) {
            resolve(ret.object.id);
          } else reject(JSON.stringify(ret.error));
        }
      });
    });
  }

};


