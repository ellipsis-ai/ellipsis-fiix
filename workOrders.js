"use strict";

module.exports = ellipsis => {
  const client = require('./sdk')(ellipsis);
  const guestUserId = parseInt(ellipsis.env.FIIX_GUEST_USER_ID);

  const slackProfile = ellipsis.userInfo.messageInfo.details.profile;
  const reporterName = reporterDetail("realName", "Anonymous guest");
  const reporterEmail = reporterDetail("email", "<no email provided>");
  const reporterPhone = reporterDetail("phone", "<no phone number provided>");

  return {
    create: createWorkOrder,
    maintenanceTypeIdFor: maintenanceTypeIdFor,
    findWorkOrder: findWorkOrder
  };

  function reporterDetail(detail, fallback) {
    if (slackProfile && slackProfile[detail]) {
      return slackProfile[detail];
    } else {
      return fallback;
    }
  }

  function createWorkOrder(options) {
    return new Promise((resolve, reject) => {
      createBareWorkOrder(options).then(workOrderId => {
        createWorkOrderLocation(workOrderId, location).then(() => {
          setRequestorFor(workOrderId).then(() => {
            resolve(workOrderId);
          });
        });
      });
    });
  }

  function maintenanceTypeIdFor(maintenanceTypeName) {
    return new Promise((resolve, reject) => {
      client.find({
        "className": "MaintenanceType",
        "fields": "id",
        "filters": [{ "ql": "strName = ?", "parameters": [maintenanceTypeName] }],
        "maxObjects": 1,
        "callback": function(ret) {
          if (!ret.error) {
            const found = ret.objects[0];
            resolve(found ? found.id : undefined);
          } else reject(ret.error);
        }
      });
    });
  }

  function openStatusId() {
    return new Promise((resolve, reject) => {
      client.find({
        "className": "WorkOrderStatus",
        "fields": "id",
        "filters": [{ "ql": "strName = ?", "parameters": ["Open"] }],
        "maxObjects": 1,
        "callback": function(ret) {
          if (!ret.error) {
            const found = ret.objects[0];
            resolve(found ? found.id : undefined);
          } else reject(ret.error);
        }
      });
    });
  }

  function requestedStatusId() {
    return new Promise((resolve, reject) => {
      client.find({
        "className": "WorkOrderStatus",
        "fields": "id",
        "filters": [{ "ql": "strName = ?", "parameters": ["Requested"] }],
        "maxObjects": 1,
        "callback": function(ret) {
          if (!ret.error) {
            const found = ret.objects[0];
            resolve(found ? found.id : undefined);
          } else reject(ret.error);
        }
      });
    });
  }

  function lowPriorityId() {
    return new Promise((resolve, reject) => {
      client.find({
        "className": "Priority",
        "fields": "id",
        "filters": [{ "ql": "strName = ?", "parameters": ["Low"] }],
        "maxObjects": 1,
        "callback": function(ret) {
          if (!ret.error) {
            const found = ret.objects[0];
            resolve(found ? found.id : undefined);
          } else reject(ret.error);
        }
      });
    });
  }

  function setRequestorFor(workOrderId) {
    return new Promise((resolve, reject) => {
      client.change({
        "className": "WorkOrder",
        "changeFields": "intRequestedByUserID",
        "object": {
          "id": workOrderId,
          "intRequestedByUserID": guestUserId
        },
        "fields": "id, intRequestedByUserID",
        "callback": function(ret) {
          if (!ret.error) {
            resolve(ret.object.id);
          } else reject(JSON.stringify(ret.error));
        }
      });
    });
  }

  function createBareWorkOrder(options) {
    return new Promise((resolve, reject) => {
      maintenanceTypeIdFor(options.maintenanceTypeName).then(maintenanceTypeId => {
        requestedStatusId().then(requestedStatusId => {
          lowPriorityId().then(lowPriorityId => {
            const locationId = options.location ? parseInt(options.location.siteId) : undefined;
            client.add({
              "className" : "WorkOrder",
              "fields": "id",
              "object" : {
                "intRequestedByUserID": guestUserId,
                "intMaintenanceTypeID" : maintenanceTypeId,
                "intPriorityID": lowPriorityId,
                "intWorkOrderStatusID" : requestedStatusId,
                "intSiteID": locationId,
                "strDescription" : options.description,
                "strNameUserGuest" : reporterName,
                "strEmailUserGuest" : reporterEmail,
                "strPhoneUserGuest" : reporterPhone,
                "dtmSuggestedCompletionDate": options.suggestedCompletionDate
              },
              "callback": function(ret) {
                if (!ret.error) {
                  resolve(ret.object.id);
                } else reject(JSON.stringify(ret.error));
              }
            });
          });
        });
      });
    });
  }

  function createWorkOrderLocation(workOrderId, location) {
    return new Promise((resolve, reject) => {
      client.add({
        "className" : "WorkOrderAsset",
        "fields": "id",
        "object" : {
          "intWorkOrderID" : workOrderId,
          "intAssetID" : parseInt(location.id)
        },
        "callback": function(ret) {
          if (!ret.error) {
            resolve(ret.object.id);
          } else reject(JSON.stringify(ret.error));
        }
      });
    });
  }

  function findWorkOrder(workOrderId) {
    return new Promise((resolve, reject) => {
      client.find({
        className: "WorkOrder",
        fields: "id, strDescription, strNameUserGuest, strEmailUserGuest, strPhoneUserGuest, intRequestedByUserID",
        "filters": [{ "ql": "id = ?", "parameters": [workOrderId] }],
        "callback": function(ret) {
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
