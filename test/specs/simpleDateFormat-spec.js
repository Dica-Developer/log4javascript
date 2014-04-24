/*global define, describe, it, expect, beforeEach*/
define(['log4js', 'simpleDateFormat'], function (log4js) {
  'use strict';

  describe('#SimpleDateFormat', function () {

    var simpleDateFormat = null;

    beforeEach(function(){
      simpleDateFormat = new log4js.SimpleDateFormat();
    });

    it('.setMinimalDaysInFirstWeek should set .minimalDaysInFirstWeek', function(){
      simpleDateFormat.setMinimalDaysInFirstWeek(2);
      expect(simpleDateFormat.minimalDaysInFirstWeek).toBe(2);
    });

    it('.getMinimalDaysInFirstWeek should return default value if not set', function(){
      expect(simpleDateFormat.getMinimalDaysInFirstWeek()).toBe(1);
    });

    it('.getMinimalDaysInFirstWeek should return given number after setting', function(){
      simpleDateFormat.setMinimalDaysInFirstWeek(2);
      expect(simpleDateFormat.getMinimalDaysInFirstWeek()).toBe(2);
    });

    describe('#Date', function(){

      var date1 = null, date2 = null, specificDate = null,
        onWeekInMilliSeconds = (60*60*24*7*1000);

      beforeEach(function(){
        date1 = new Date();
        date2 = new Date(date1.getTime() - onWeekInMilliSeconds);
        specificDate = new Date(2023, 2, 23);
      });

      it('.getDifference', function(){
        expect(date1.getDifference(date2)).toBe(onWeekInMilliSeconds);
      });

      it('.isBefore', function(){
        expect(date1.isBefore(date2)).toBe(false);
        expect(date2.isBefore(date1)).toBe(true);
      });

      it('.getTimeSince', function(){
        expect(date1.getTimeSince(date2)).toBe(onWeekInMilliSeconds);
        expect(date2.getTimeSince(date1)).toBe(-1 * onWeekInMilliSeconds);
      });

      it('.getPreviousSunday', function(){
        expect(specificDate.getPreviousSunday()).toEqual(new Date(2023 , 2, 19));
      });

      it('.getDayInYear', function(){
        expect(specificDate.getDayInYear()).toBe(82);
      });

      it('.getWeekInYear', function(){
        expect(specificDate.getWeekInYear()).toBe(12);
      });

      it('.getWeekInYear', function(){
        specificDate.minimalDaysInFirstWeek = 1;
        expect(specificDate.getWeekInYear()).toBe(12);
      });

      it('.getWeekInYear', function(){
        specificDate.minimalDaysInFirstWeek = 1;
        expect(specificDate.getWeekInYear(9)).toBe(11);
      });

      it('.getWeekInMonth', function(){
        expect(specificDate.getWeekInMonth()).toBe(4);
      });

      it('.getWeekInMonth', function(){
        specificDate.minimalDaysInFirstWeek = 1;
        expect(specificDate.getWeekInMonth()).toBe(3);
      });

      it('.getWeekInMonth', function(){
        specificDate.minimalDaysInFirstWeek = 1;
        expect(specificDate.getWeekInMonth(1)).toBe(4);
      });

    });

    describe('#PatternLayout.ABSOLUTETIME_DATEFORMAT = "HH:mm:ss,SSS"', function(){

      var simpleDateFormat = null;

      beforeEach(function(){
        simpleDateFormat = new log4js.SimpleDateFormat('HH:mm:ss,SSS');
      });

      it('Given parameter should override .formatString', function(){
        expect(simpleDateFormat.formatString).toBe('HH:mm:ss,SSS');
      });

    });

    describe('.format', function(){

      var specificDatePM = new Date(2023, 2, 23, 23, 42, 12);
      var specificDateAM = new Date(2023, 2, 23, 10, 42, 12);

      it('Pattern "G" should return "AD"', function(){
        var simpleDateFormat = new log4js.SimpleDateFormat('G');
        expect(simpleDateFormat.format(specificDatePM)).toBe('AD');
      });

      it('Pattern "y" should return full year', function(){
        var simpleDateFormat = new log4js.SimpleDateFormat('y');
        expect(simpleDateFormat.format(specificDatePM)).toBe('23');
      });

      it('Pattern "M" should return full month', function(){
        var simpleDateFormat = new log4js.SimpleDateFormat('M');
        expect(simpleDateFormat.format(specificDatePM)).toBe('3');
      });

      it('Pattern "w" should return week in year', function(){
        var simpleDateFormat = new log4js.SimpleDateFormat('w');
        expect(simpleDateFormat.format(specificDatePM)).toBe('12');
      });

      it('Pattern "W" should return week in month', function(){
        var simpleDateFormat = new log4js.SimpleDateFormat('W');
        expect(simpleDateFormat.format(specificDatePM)).toBe('4');
      });

      it('Pattern "d" should return day in month', function(){
        var simpleDateFormat = new log4js.SimpleDateFormat('d');
        expect(simpleDateFormat.format(specificDatePM)).toBe('23');
      });

      it('Pattern "D" should return day in year', function(){
        var simpleDateFormat = new log4js.SimpleDateFormat('D');
        expect(simpleDateFormat.format(specificDatePM)).toBe('82');
      });

      it('Pattern "F" should return day of week in month', function(){
        var simpleDateFormat = new log4js.SimpleDateFormat('F');
        expect(simpleDateFormat.format(specificDatePM)).toBe('4');
      });

      it('Pattern "E" should return day in week', function(){
        var simpleDateFormat = new log4js.SimpleDateFormat('E');
        expect(simpleDateFormat.format(specificDatePM)).toBe('Thu');
      });

      it('Pattern "a" should return AM/PM', function(){
        var simpleDateFormat = new log4js.SimpleDateFormat('a');
        expect(simpleDateFormat.format(specificDatePM)).toBe('PM');
        expect(simpleDateFormat.format(specificDateAM)).toBe('AM');
      });

      it('Pattern "H" should return hour in day 0-23', function(){
        var simpleDateFormat = new log4js.SimpleDateFormat('H');
        expect(simpleDateFormat.format(specificDatePM)).toBe('23');
        expect(simpleDateFormat.format(specificDateAM)).toBe('10');
      });

      it('Pattern "k" should return hour in day 1-24', function(){
        var simpleDateFormat = new log4js.SimpleDateFormat('k');
        expect(simpleDateFormat.format(specificDatePM)).toBe('23');
        expect(simpleDateFormat.format(specificDateAM)).toBe('10');
      });

      it('Pattern "K" should return hour in am/pm 0-11', function(){
        var simpleDateFormat = new log4js.SimpleDateFormat('K');
        expect(simpleDateFormat.format(specificDatePM)).toBe('11');
        expect(simpleDateFormat.format(specificDateAM)).toBe('10');
      });

      it('Pattern "h" should return hour in am/pm 1-12', function(){
        var simpleDateFormat = new log4js.SimpleDateFormat('h');
        expect(simpleDateFormat.format(specificDatePM)).toBe('11');
        expect(simpleDateFormat.format(specificDateAM)).toBe('10');
      });

      it('Pattern "m" should return minute in hour', function(){
        var simpleDateFormat = new log4js.SimpleDateFormat('m');
        expect(simpleDateFormat.format(specificDatePM)).toBe('42');
      });

      it('Pattern "s" should return second in minute', function(){
        var simpleDateFormat = new log4js.SimpleDateFormat('s');
        expect(simpleDateFormat.format(specificDatePM)).toBe('12');
      });

      it('Pattern "S" should return millisecond', function(){
        var simpleDateFormat = new log4js.SimpleDateFormat('S');
        expect(simpleDateFormat.format(specificDatePM)).toBe('0');
      });

      it('Pattern "Z" should return timezone offset', function(){
        var simpleDateFormat = new log4js.SimpleDateFormat('Z');
        expect(simpleDateFormat.format(specificDatePM)).toBe('+0100');
      });

      it('Quoted patter should return as is', function(){
        var simpleDateFormat = new log4js.SimpleDateFormat('\'Z\'');
        expect(simpleDateFormat.format(specificDatePM)).toBe('Z');
      });

      it('Quoted patter should return as is', function(){
        var simpleDateFormat = new log4js.SimpleDateFormat('\'\'');
        expect(simpleDateFormat.format(specificDatePM)).toBe('\'');
      });

      it('Other characters should return as is', function(){
        var simpleDateFormat = new log4js.SimpleDateFormat('?');
        expect(simpleDateFormat.format(specificDatePM)).toBe('?');
      });

      it('Other pattern characters should return nothing', function(){
        var simpleDateFormat = new log4js.SimpleDateFormat('r');
        expect(simpleDateFormat.format(specificDatePM)).toBe('');
      });

    });

  });
});