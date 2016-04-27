/*
 *  ChutyChart
 *  A stock data graphing and analysis library.
 *  By: Ian Herve U. Chu Te
 */

(function (window, document, Object, console, Math, animate, CanvasRenderingContext2D, round, clone, THRESHOLD_RATIO) {

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Override original fillRect with no sub-pixel fillRect.
  CanvasRenderingContext2D.prototype._fillRect = CanvasRenderingContext2D.prototype.fillRect;
  CanvasRenderingContext2D.prototype.fillRect = function (a, b, c, d) {
    return this._fillRect(round(a), round(b), round(c), round(d));
  };

  function ChutyChart(id, data, interpolate, customHeight, customThickness) {

    animate(function () {
      if (typeof interpolate === 'boolean' && interpolate) {
        _ChutyChart(id, _interpolate(data), customHeight, customThickness);
      } else {
        _ChutyChart(id, data, customHeight, customThickness);
      }
    });

  }

  function _ChutyChart(id, _data, customHeight, customThickness) {

    var container = document.getElementById(id);
    var canvas = _generateElement('canvas');

    _html(container, '');
    container.style.overflowX = 'scroll';
    canvas.style.cursor = 'none';

    var context = canvas.getContext('2d');

    var thickness = customThickness || 10;
    var height = container.height =  canvas.height = context.canvas.clientHeight = customHeight || 400; // fullHeight

    data = _unique(_data.slice(0, 2600));
    data.reverse();

    var width = canvas.width = context.canvas.clientWidth = data.length * thickness;

    var

        // open = _getStatistics( data, 'open' ),
        high = _getStatistics(data, 'h'),
        low = _getStatistics(data, 'l'),

        // close = _getStatistics( data, 'close' ),
        volume = _getStatistics(data, 'v'),
        min = low.min,
        max = high.max;

    var xPos = 0;

    context.clearRect(0, 0, width, height);
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);
    context.fillRect(0, 0, width, height);

    var candleStickAreaHeight = 4 * height / 5,
        volumeAreaHeight = height / 5;

    // volume-price separator.
    context.fillStyle = 'white';
    context.fillRect(0, candleStickAreaHeight, width, 1);

    data.forEach(function (datum) {

      _pushDerivedFields(datum);
      _drawCandleStickWick(context, datum, xPos, thickness, min, max, candleStickAreaHeight);
      _drawCandleStickBody(context, datum, xPos, thickness, min, max, candleStickAreaHeight);
      _drawVolume(context, datum, xPos, thickness, volume.min, volume.max, volumeAreaHeight, candleStickAreaHeight, volume.threshold);
      _drawWeekSeparatorLine(context, datum.d, xPos, height);
      _drawMonthSeparatorLine(context, datum.d, xPos, height);
      xPos += thickness;

    });

    container.appendChild(canvas);
    _enableTooltip(canvas, container, thickness, data, context, candleStickAreaHeight, min, max, volume.min, volume.max, volumeAreaHeight, volume.threshold);

    container.scrollLeft = container.scrollWidth;

  }

  function _unique(a) {

    var dates = [], values = [];

    for (var i = 0; i < a.length; i++) {
      var date = new Date(a[i].d * 1000).toDateString();
      if (dates.indexOf(date) === -1) {
        dates.push(date);
        values.push(a[i]);
      }
    }

    return values;

  }

  function _drawCandleStickBody(context, datum, x, thickness, min, max, height, selected) {

    var close = datum.c,
        open = datum.o,
        high = datum.h,
        low = datum.l,
        isInterpolate = typeof datum.isInterpolate !== 'undefined',
        color = isInterpolate
            ? datum.c === datum.o ? 'rgba(128, 128, 128, 0.2)' : (datum.c > datum.o ? 'rgba(0,128,0, 0.2)' : 'rgba(255,0,0, 0.2)')
            : datum.c === datum.o ? 'gray' : (datum.c > datum.o ? 'green' : 'red'),
        isGreen = color === 'green';

    var top = isGreen ? _normalize(close, min, max, height) : _normalize(open, min, max, height);
    var candleHeight = (isGreen ? _normalize(open, min, max, height) : _normalize(close, min, max, height)) - top;
    ++candleHeight;

    /* resetting */

    if (isInterpolate) {
      context.fillStyle = 'black';
      context.fillRect(
          x,
          top,
          thickness,
          candleHeight
      );
    }

    /* end resetting */

    context.fillStyle = (selected ? 'yellow' : color);
    context.fillRect(
        x,
        top,
        thickness,
        candleHeight
    );

  }

  function _drawCandleStickWick(context, datum, x, thickness, min, max, height, selected) {

    var high = datum.h,
        low = datum.l,
        top = _normalize(high, min, max, height),
        _height = _normalize(low, min, max, height) - top,
        isInterpolate = typeof datum.isInterpolate !== 'undefined';

    /* resetting */

    if (isInterpolate) {
      context.fillStyle = 'black';
      context.fillRect(
          x,
          top,
          thickness,
          _height
      );
    }

    /* end resetting */

    context.fillStyle = isInterpolate
        ? (selected ? 'rgba(255, 255, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)')
        : (selected ? 'yellow' : 'white');
    context.fillRect(
        x + thickness / 2 - 1,
        top,
        2,
        _height
    );
  }

  function _drawVolume(context, datum, x, thickness, min, max, height, yOffset, threshold, selected) {

    var isInterpolate = typeof datum.isInterpolate !== 'undefined',
        color = isInterpolate
            ? datum.c === datum.o ? 'rgba(128, 128, 128, 0.2)' : (datum.c > datum.o ? 'rgba(0,128,0, 0.2)' : 'rgba(255,0,0, 0.2)')
            : datum.c === datum.o ? 'gray' : (datum.c > datum.o ? 'green' : 'red'),
        volume = datum.v,
        isGreen = color === 'green';

    if (!isInterpolate) // TODO
        color = (typeof threshold !== 'undefined' && datum.v >= threshold)
            ? (datum.c === datum.o ? 'cornflowerblue' : (datum.c > datum.o ? 'purple' : 'darkgoldenrod'))
            : color;

    var top = (typeof threshold !== 'undefined' && datum.v >= threshold)
        ? _normalize(volume, threshold, max, height)
        : _normalize(volume, min, threshold, height);
    var _height = height - top;
    ++_height;

    /* resetting */

    if (isInterpolate) {
      context.fillStyle = 'black';
      context.fillRect(
          x,
          top + yOffset,
          thickness,
          _height
      );
    }

    /* end resetting */

    context.fillStyle = selected ? 'yellow' : color;
    context.fillRect(
        x,
        top + yOffset,
        thickness,
        _height
    );

  }

  var lastMonth = -1;
  function _drawMonthSeparatorLine(context, date, x, height) {

    var dateObject = new Date(date * 1000);
    var currentMonth = dateObject.getMonth();

    if (currentMonth != lastMonth
         && typeof selected === 'undefined') { // once a selected parameter is supplied, it means that this is for the select-deselect portion of the code.

      var currentYear = dateObject.getYear() + 1900;
      context.fillStyle = 'white';
      context.fillRect(
          x,
          0,
          1,
          height
      );

      context.font = 'Consolas';
      context.fillText(MONTHS[currentMonth] + ' ' + currentYear, x + 10, 10);
    }

    lastMonth = currentMonth;
  }

  var lastWeek = -1;
  function _drawWeekSeparatorLine(context, date, x, height) {

    var dateObject = new Date(date * 1000);
    var currentWeek = getWeekNumber(dateObject);

    if (currentWeek !== lastWeek
         && typeof selected === 'undefined') { // once a selected parameter is supplied, it means that this is for the select-deselect portion of the code.

      context.fillStyle = 'rgba(101, 156, 239, 0.1)';
      context.fillRect(
          x,
          0,
          1,
          height
      );
    }

    lastWeek = currentWeek;
  }

  function _getStatistics(data, map) {

    if (data.length === 0)
        return { min: 0, max: 0 };

    var max = data[0][map],
        min = data[0][map],
        sum = 0;

    data.forEach(function (datum) {
      var current = datum[map];
      if (current > max)
          max = current;
      if (current < min)
          min = current;
      sum += current;
    });

    var avg = sum / data.length,
        threshold = avg * THRESHOLD_RATIO;

    return {
      max: max, min: min, avg: avg, threshold: threshold,
    };

  }

  function _normalize(quantity, min, max, height) {

    return height - ((quantity - min) / (max - min) * height);

  }

  function _pushDerivedFields(datum) {
    datum.ds = new Date(datum.d * 1000).toLocaleDateString(),
    datum.vos = datum.v.toLocaleString(),
    datum.cs = Math.round((datum.c - datum.o) / datum.o * 10000) / 100 + '%',
    datum.vas = (Math.round((datum.c + datum.o) / 2 * datum.v)).toLocaleString();
  }

  function _interpolate(data) {

    data = data.sort(function (a, b) { return a.d - b.d; });

    var i, interpolatedData = [];
    for (i = 0; i < data.length - 1; ++i) {

      var first = data[i],
          second = data[i + 1],
          firstDate = new Date(first.d * 1000),
          secondDate = new Date(second.d * 1000),
          interpolates = _interpolatePair(first, second);

      interpolatedData = interpolatedData.concat(interpolates);

    }

    var result = data.concat(interpolatedData).sort(function (a, b) { return b.d - a.d; });

    return result;

  }

  function _interpolatePair(first, second) {

    var days = (second.d - first.d) / (60 * 60 * 24);

    if (days <= 1)
        return [];

    var i = 0,
            interval = {
              o: (second.o - first.o) / days,
              h: (second.h - first.h) / days,
              l: (second.l - first.l) / days,
              c: (second.c - first.c) / days,
              v: (second.v - first.v) / days,
            };

    var results = [],
        current = first;

    for (i = 0; i < days - 1; ++i) {

      current.d += (60 * 60 * 24);

      current.o += interval.o;
      current.h += interval.h;
      current.l += interval.l;
      current.c += interval.c;
      current.v += interval.v;

      current.o = Math.round(current.o * 10000) / 10000;
      current.h = Math.round(current.h * 10000) / 10000;
      current.l = Math.round(current.l * 10000) / 10000;
      current.c = Math.round(current.c * 10000) / 10000;
      current.v = Math.round(current.v * 10000) / 10000;

      current.isInterpolate = true;

      results.push(clone(current));

    }

    return results;

  }

  function getWeekNumber(d) {

    d = new Date(+d);
    d.setHours(0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    var yearStart = new Date(d.getFullYear(), 0, 1);
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;

  }

  function _enableTooltip(canvas, container, thickness, data, context, height, min, max, vmin, vmax, volumeHeight, volumeThreshold) {

    var tooltip = _generateTooltipTemplate();

    container.appendChild(tooltip);

    var offsetLeft = container.parentNode.offsetLeft,
        offsetTop = container.parentNode.offsetTop,
        halfWidth = container.offsetWidth / 2 + offsetLeft,
        halfHeight = container.offsetHeight / 2; // + offsetTop; // QUIRK: I don't know why it works when offsetTop is excluded.

    var lastHash = 0,
        formerIndex = -1,
        total = data.length;

    canvas.addEventListener('mousemove', function (e) {

      var index = Math.round(e.layerX / thickness) - 1;

      if (index >= total || index === -1)
          return false;

      var datum = data[index];

      var x = (e.pageX - offsetLeft),
          y = (e.pageY - offsetTop);

      animate(function () {
        tooltip.style.left = ((x < halfWidth) ? x : (x - tooltip.offsetWidth)) + 'px';
        tooltip.style.top = ((y < halfHeight) ? y : (y - tooltip.offsetHeight)) + 'px';
      });

      if (datum.d === lastHash)
          return false;

      animate(function () {
        _html(valueClose, datum.c);
        _html(valueOpen, datum.o);
        _html(valueHigh, datum.h);
        _html(valueLow, datum.l);
        _html(valueDate, datum.ds);
        _html(valueVolume, datum.vos);
        _html(valueChange, datum.cs);
        _html(valueValue, datum.vas);
        _html(valueNotes, datum.v >= volumeThreshold ? 'V-Outlier' : 'None');

        var color = datum.c === datum.o ? 'gray' : (datum.c > datum.o ? 'green' : 'red');
        tooltip.setAttribute('name', color);
      });

      animate(function () {
        // formerly selected candle.
        if (formerIndex !== -1) {
          var candleOffsetFormer = formerIndex * thickness,
              formerDatum = data[formerIndex];
          _drawCandleStickWick(context, formerDatum, candleOffsetFormer, thickness, min, max, height, false);
          _drawCandleStickBody(context, formerDatum, candleOffsetFormer, thickness, min, max, height, false);
          _drawVolume(context, formerDatum, candleOffsetFormer, thickness, vmin, vmax, volumeHeight, height, volumeThreshold, false);
        }

        // newly selected candle.
        var candleOffsetNew = index * thickness;
        _drawCandleStickWick(context, datum, candleOffsetNew, thickness, min, max, height, true);
        _drawCandleStickBody(context, datum, candleOffsetNew, thickness, min, max, height, true);
        _drawVolume(context, datum, candleOffsetNew, thickness, vmin, vmax, volumeHeight, height, volumeThreshold, true);
        formerIndex = index;
      });

      lastHash = datum.d;
    });

  }

  var valueClose,
      valueOpen,
      valueHigh,
      valueLow,
      valueDate,
      valueVolume,
      valueChange,
      valueValue,
      valueNotes;

  function _generateElement(element) {
    return document.createElement(element);
  }

  function _appendChild(parent, child) {
    return parent.appendChild(child);
  }

  function _html(element, value) {
    element.innerHTML = value;
  }

  function _generateTooltipTemplate() {

    var tooltip = _generateElement('table'),
        tbody = _generateElement('tbody'),
        close = _generateElement('tr'),
        open = _generateElement('tr'),
        high = _generateElement('tr'),
        low = _generateElement('tr'),
        date = _generateElement('tr'),
        volume = _generateElement('tr'),
        change = _generateElement('tr'),
        value = _generateElement('tr'),
        notes = _generateElement('tr');

    var labelClose = _appendChild(close, _generateElement('td'));
    var labelOpen = _appendChild(open, _generateElement('td'));
    var labelHigh = _appendChild(high, _generateElement('td'));
    var labelLow = _appendChild(low, _generateElement('td'));
    var labelDate = _appendChild(date, _generateElement('td'));
    var labelVolume = _appendChild(volume, _generateElement('td'));
    var labelChange = _appendChild(change, _generateElement('td'));
    var labelValue =  _appendChild(value, _generateElement('td'));
    var labelNotes = _appendChild(notes, _generateElement('td'));

    _html(labelClose, 'Close');
    _html(labelOpen, 'Open');
    _html(labelHigh, 'High');
    _html(labelLow, 'Low');
    _html(labelDate, 'Date');
    _html(labelVolume, 'Volume');
    _html(labelChange, 'Change');
    _html(labelValue, 'Value');
    _html(labelNotes, 'Remarks');

    valueClose = _appendChild(close, _generateElement('td'));
    valueOpen = _appendChild(open, _generateElement('td'));
    valueHigh = _appendChild(high, _generateElement('td'));
    valueLow = _appendChild(low, _generateElement('td'));
    valueDate = _appendChild(date, _generateElement('td'));
    valueVolume = _appendChild(volume, _generateElement('td'));
    valueChange = _appendChild(change, _generateElement('td'));
    valueValue =  _appendChild(value, _generateElement('td'));
    valueNotes = _appendChild(notes, _generateElement('td'));

    tooltip.className = 'chutyChartTooltip';

    _appendChild(tbody, close);
    _appendChild(tbody, open);
    _appendChild(tbody, high);
    _appendChild(tbody, low);
    _appendChild(tbody, date);
    _appendChild(tbody, volume);
    _appendChild(tbody, change);
    _appendChild(tbody, value);
    _appendChild(tbody, notes);
    _appendChild(tooltip, tbody);

    tooltip.id = 'chutyChartTooltip';

    tooltip.style.cursor = 'none';

    return tooltip;
  }

  window.ChutyChart = window.ChutyChart || ChutyChart || function () { console.log('ChutyChart library has encountered a problem!'); };

})(

window,
document,
Object,
console,
Math,
window.requestAnimationFrame || function (f) { window.setTimeout(f, 0); },

CanvasRenderingContext2D,
function (n) { return (n + 0.5) | 0; },

function (o) { return JSON.parse(JSON.stringify(o)); },

2);
