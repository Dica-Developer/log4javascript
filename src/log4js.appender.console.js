/*global window*/
define(['log4js.helper', 'log4js.core', 'log4js.consoleAppenderHtml', 'log4js.appender'], function(helper, log4js, consoleAppenderHtml){
  'use strict';

  function ConsoleAppender(options){
    options = options || {};
    this.options = {
      inPage: options.inPage || true
    };
  }

  ConsoleAppender.prototype = new log4js.Appender();

  ConsoleAppender.prototype.create = function(){

    //setLayout is inherited from Appender
//    this.setLayout(this.default.layout);

    if(this.options.inPage){
      this.injectDom();
    }

    this.append = function(){

    };

    this.group = function(){

    };

    this.groupEnd = function(){

    };

    this.toString = function(){
      return 'ConsoleAppender';
    };
  };

  ConsoleAppender.prototype.injectDom = function(){
    var containerElement = window.document.createElement('div');
    containerElement.style.position = 'fixed';
    containerElement.style.left = '0';
    containerElement.style.right = '0';
    containerElement.style.bottom = '0';
    window.document.body.appendChild(containerElement);
//    appender.addCssProperty('borderWidth', '1px 0 0 0');
//    appender.addCssProperty('zIndex', 1000000);

    var iframeContainerDiv = containerElement.appendChild(window.document.createElement('div'));

    iframeContainerDiv.style.width = '100%';
    iframeContainerDiv.style.height = '200px';
    iframeContainerDiv.style.border = 'solid gray 1px';
    iframeContainerDiv.style.borderWidth = '1px 0 0 0';

    var iframeSrc = '';
    var iframeId = '__ConsoleAppender__' + helper.getUUID();

    // Adding an iframe using the DOM would be preferable, but it doesn't work
    // in IE5 on Windows, or in Konqueror prior to version 3.5 - in Konqueror
    // it creates the iframe fine but I haven't been able to find a way to obtain
    // the iframe's window object
    iframeContainerDiv.innerHTML = '<iframe id="' + iframeId + '" name="' + iframeId +
      '" width="100%" height="100%" frameborder="0"' + iframeSrc +
      ' scrolling="no"></iframe>';

    var iframe = window.document.getElementById(iframeId);
    var html = consoleAppenderHtml;
    var doc = iframe.contentDocument;
    doc.open();
    doc.writeln(html);
    doc.close();
  };

  ConsoleAppender.prototype.addIframe = function(){

  };

  log4js.ConsoleAppender = ConsoleAppender;

});
