"use strict";

module.exports = ellipsis => {
  const client = require('sdk')(ellipsis);

  return {
    fetchSites: fetchSites,
    fetchLocations: fetchLocations
  };

  function fetchSites() {
    return fetchLocations().then(locs => {
      return locs.filter(ea => ea.id == ea.intSiteID);
    })
  }

  function fetchLocations(site) {
    return new Promise((resolve, reject) => {
      const locationFilter = { "ql": "intCategoryID = ?", "parameters": [ellipsis.env.FIIX_LOCATION_CATEGORY_ID] };
      const filters = [locationFilter];
      if (site) {
        filters.push({ "ql": "intSiteID = ?", "parameters": [parseInt(site.id)]});
      }
      client.find({
        "className": "Asset",
        "fields": "id, strName, strDescription, intSiteID",
        "filters": filters,
        "maxObjects": 98,
        "callback": function(ret) {
          if (!ret.error) {
            if (site) {
              resolve(ret.objects.filter(ea => ea.id != ea.intSiteID));
            } else {
              resolve(ret.objects);
            }
          } else reject(ret.error);
        }
      });
    });
  }

};
