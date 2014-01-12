/*global define, describe, it, expect*/
define(['log4javascript'], function(log4js){
  'use strict';

//  console.log(log4js);
  describe('log4js should defined and initiate with all Appender and Layouts', function () {

    it('log4js should be defined', function () {
      expect(log4js).toBeDefined();
    });

    describe('log4js prototypes should defined', function () {

      it('log4js.Level should be defined', function () {
        expect(log4js.Level).toBeDefined();
      });

      it('log4js.evalInScope should be defined', function () {
        expect(log4js.evalInScope).toBeDefined();
      });

      it('log4js.eventListeners should be defined', function () {
        expect(log4js.eventListeners).toBeDefined();
      });

      it('log4js.eventTypes should be defined', function () {
        expect(log4js.eventTypes).toBeDefined();
      });

      it('log4js.getDefaultLogger should be defined', function () {
        expect(log4js.getDefaultLogger).toBeDefined();
      });

      it('log4js.getLogger should be defined', function () {
        expect(log4js.getLogger).toBeDefined();
      });

      it('log4js.getNullLogger should be defined', function () {
        expect(log4js.getNullLogger).toBeDefined();
      });

      it('log4js.getRootLogger should be defined', function () {
        expect(log4js.getRootLogger).toBeDefined();
      });

      it('log4js.isEnabled should be defined', function () {
        expect(log4js.isEnabled).toBeDefined();
      });

      it('log4js.isTimeStampsInMilliseconds should be defined', function () {
        expect(log4js.isTimeStampsInMilliseconds).toBeDefined();
      });

      it('log4js.logLog should be defined', function () {
        expect(log4js.logLog).toBeDefined();
      });

      it('log4js.resetConfiguration should be defined', function () {
        expect(log4js.resetConfiguration).toBeDefined();
      });

      it('log4js.setDocumentReady should be defined', function () {
        expect(log4js.setDocumentReady).toBeDefined();
      });

      it('log4js.setEnabled should be defined', function () {
        expect(log4js.setEnabled).toBeDefined();
      });

      it('log4js.setShowStackTraces should be defined', function () {
        expect(log4js.setShowStackTraces).toBeDefined();
      });

      it('log4js.setTimeStampsInMilliseconds should be defined', function () {
        expect(log4js.setTimeStampsInMilliseconds).toBeDefined();
      });
    });
  });
});
