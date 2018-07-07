"use strict";

const FiixCmmsClient = require('fiix-cmms-client');

module.exports = ellipsis => {
  const subdomain = ellipsis.env.FIIX_SUBDOMAIN;
  const appKey = ellipsis.env.FIIX_APPLICATION_KEY;
  const accessKey = ellipsis.env.FIIX_ACCESS_KEY;
  const secret = ellipsis.env.FIIX_SECRET;

  var fiixCmmsClient = new FiixCmmsClient();

  fiixCmmsClient.setBaseUri(`https://${subdomain}.macmms.com/api/`);
  fiixCmmsClient.setAppKey(appKey);
  fiixCmmsClient.setAuthToken(accessKey);
  fiixCmmsClient.setPKey(secret);

  return fiixCmmsClient;
}
