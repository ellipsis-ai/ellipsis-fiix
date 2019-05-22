module.exports = (ellipsis) => {
  const client = require('./sdk')(ellipsis);

  return {
    find: find,
    findAll: findAll
  }

  function assetFields() {
    return [
      "id",
      "strName",
      "strDescription",
      "strMake",
      "strModel",
      "qtyMinStockCount",
      "strCity",
      "strShippingTerms",
      "strAddress",
      "strNotes",
      "strProvince",
      "intCountryID",
      "strInventoryCode",
      "qtyStockCount",
      "intSiteID",
      "strRow",
      "strAisle",
      "strBinNumber",
      "strPostalCode",
      "strSerialNumber",
      "strCode",
      "dblLatitude",
      "dblLongitude",
      "intAssetLocationID",
      "bolIsOnline",
      "intKind",
      "intAssetParentID",
      "bolIsRegion",
      "bolIsSite",
      "strBarcode",

      "dv_intCategoryID",
      "dv_intSiteID",
      "dv_intCountryID",
      "dv_intAssetLocationID",
      "dv_intAssetParentID",
      "cf_assetAddressString"
    ]
  }

  function findAll(assetIds) {
    if (assetIds.length === 0) {
      return Promise.resolve([]);
    }
    return new Promise((resolve, reject) => {
      client.find({
        "className": "Asset",
        "fields": assetFields().join(", "),
        "filters": [{
          "ql": `id IN (${assetIds.map(() => "?").join(",")})`,
          "parameters": assetIds
        }],
        "callback": function (ret) {
          if (!ret.error) {
            resolve(ret.objects);
          } else {
            reject(ret.error);
          }
        }
      })
    });
  }

  function find(assetId) {
    return findAll([assetId]).then((assets) => {
      Promise.resolve(assets[0] || null);
    });
  }
}
