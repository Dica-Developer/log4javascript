/**
 * NullLayout
 * @constructor
 * @mixes Layout
 */
function NullLayout() {
  'use strict';

  this.customFields = [];
}

/**
 *
 * @type {Layout}
 */
NullLayout.prototype = new Layout();

/**
 *
 * @param loggingEvent
 * @returns {Array}
 */
NullLayout.prototype.format = function (loggingEvent) {
  'use strict';

  return loggingEvent.messages;
};

/**
 *
 * @returns {Boolean}
 */
NullLayout.prototype.ignoresThrowable = function () {
  'use strict';

  return true;
};

/**
 *
 * @returns {String}
 */
NullLayout.prototype.toString = function () {
  'use strict';

  return 'NullLayout';
};

if(typeof log4javascript !== 'undefined'){
  /**
   *
   * @type {NullLayout}
   */
  log4javascript.NullLayout = NullLayout;
}
