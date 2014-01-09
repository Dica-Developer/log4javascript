/* ---------------------------------------------------------------------- */
// HttpPostDataLayout

function HttpPostDataLayout() {
  this.setKeys();
  this.customFields = [];
  this.returnsPostData = true;
}

HttpPostDataLayout.prototype = new Layout();

// Disable batching
HttpPostDataLayout.prototype.allowBatching = function() {
  return false;
};

HttpPostDataLayout.prototype.format = function(loggingEvent) {
  var dataValues = this.getDataValues(loggingEvent);
  var queryBits = [];
  for (var i = 0, len = dataValues.length; i < len; i++) {
    var val = (dataValues[i][1] instanceof Date) ?
      String(dataValues[i][1].getTime()) : dataValues[i][1];
    queryBits.push(urlEncode(dataValues[i][0]) + "=" + urlEncode(val));
  }
  return queryBits.join("&");
};

HttpPostDataLayout.prototype.ignoresThrowable = function(loggingEvent) {
  return false;
};

HttpPostDataLayout.prototype.toString = function() {
  return "HttpPostDataLayout";
};

log4javascript.HttpPostDataLayout = HttpPostDataLayout;