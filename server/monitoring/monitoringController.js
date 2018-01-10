module.exports = {
  initMonitoring
}
 var monitoringService = require("./monitoringServices.js");

function initMonitoring(callback){
  monitoringService.initMonitoring(callback);
}
