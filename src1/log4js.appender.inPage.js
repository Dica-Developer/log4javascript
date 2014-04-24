/**
 *
 * @param {HTMLElement} container
 * @param {Boolean} lazyInit
 * @param {Boolean} initiallyMinimized
 * @param {Boolean} useDocumentWrite
 * @param {String} width
 * @param {String} height
 * @constructor
 * @mixes ConsoleAppender
 */
function InPageAppender(
  container,
  lazyInit,
  initiallyMinimized,
  useDocumentWrite,
  width,
  height
  ) {
  'use strict';

  /**
   * @todo document
   */
  this.create(
    true,
    container,
    lazyInit,
    initiallyMinimized,
    useDocumentWrite,
    width,
    height,
    false
  );
}

/**
 *
 * @type {ConsoleAppender}
 */
InPageAppender.prototype = new ConsoleAppender();

/**
 *
 * @type {{layout: PatternLayout, initiallyMinimized: boolean, lazyInit: boolean, newestMessageAtTop: boolean, scrollToLatestMessage: boolean, width: string, height: string, maxMessages: null, showCommandLine: boolean, commandLineObjectExpansionDepth: number, showHideButton: boolean, showCloseButton: boolean, showLogEntryDeleteButtons: boolean, useDocumentWrite: boolean}}
 */
InPageAppender.prototype.defaults = {
  layout: new PatternLayout('%d{HH:mm:ss} %-5p - %m{1}%n'),
  initiallyMinimized: false,
  lazyInit: true,
  newestMessageAtTop: false,
  scrollToLatestMessage: true,
  width: '100%',
  height: '220px',
  maxMessages: null,
  showCommandLine: true,
  commandLineObjectExpansionDepth: 1,
  showHideButton: false,
  showCloseButton: false,
  showLogEntryDeleteButtons: true,
  useDocumentWrite: true
};

/**
 *
 * @returns {String}
 */
InPageAppender.prototype.toString = function() {
  'use strict';

  return 'InPageAppender';
};

/**
 *
 * @type {InPageAppender}
 */
log4javascript.InPageAppender = InPageAppender;

/**
 * For backwards compatibility
 * @type {InPageAppender}
 */
log4javascript.InlineAppender = InPageAppender;