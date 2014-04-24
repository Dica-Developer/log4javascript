/**
 * HttpPostDataLayout
 * @constructor
 * @mixes Layout
 */
function HttpPostDataLayout() {
  'use strict';

  this.setKeys();
  this.customFields = [];
  this.returnsPostData = true;
}

/**
 *
 * @type {Layout}
 */
HttpPostDataLayout.prototype = new Layout();

/**
 * Disable batching
 * @returns {Boolean}
 */
HttpPostDataLayout.prototype.allowBatching = function () {
  'use strict';

  return false;
};

/**
 *
 * @param loggingEvent
 * @returns {String}
 */
HttpPostDataLayout.prototype.format = function (loggingEvent) {
  'use strict';

  var dataValues = this.getDataValues(loggingEvent);
  var queryBits = [];
  for (var i = 0, len = dataValues.length; i < len; i++) {
    var val = (dataValues[i][1] instanceof Date) ?
      String(dataValues[i][1].getTime()) : dataValues[i][1];
    queryBits.push(urlEncode(dataValues[i][0]) + '=' + urlEncode(val));
  }
  return queryBits.join('&');
};

/**
 *
 * @returns {boolean}
 */
HttpPostDataLayout.prototype.ignoresThrowable = function () {
  'use strict';

  return false;
};

/**
 *
 * @returns {String}
 */
HttpPostDataLayout.prototype.toString = function () {
  'use strict';

  return 'HttpPostDataLayout';
};

if(typeof log4javascript !== 'undefined'){
  /**
   *
   * @type {HttpPostDataLayout}
   */
  log4javascript.HttpPostDataLayout = HttpPostDataLayout;
}
