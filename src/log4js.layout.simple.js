/**
 * SimpleLayout
 * @constructor
 * @mixes Layout
 */
function SimpleLayout() {
  'use strict';

  this.customFields = [];
}

/**
 *
 * @type {Layout}
 */
SimpleLayout.prototype = new Layout();

/**
 *
 * @param loggingEvent
 * @returns {String}
 */
SimpleLayout.prototype.format = function (loggingEvent) {
  'use strict';

  return loggingEvent.level.name + ' - ' + loggingEvent.getCombinedMessages();
};

/**
 *
 * @returns {Boolean}
 */
SimpleLayout.prototype.ignoresThrowable = function () {
  'use strict';

  return true;
};

/**
 *
 * @returns {string}
 */
SimpleLayout.prototype.toString = function () {
  'use strict';

  return 'SimpleLayout';
};

/**
 *
 * @type {SimpleLayout}
 */
log4javascript.SimpleLayout = SimpleLayout;