/*
 *  ChutyChart
 *  A stock data graphing and analysis library.
 *  By: Ian Herve U. Chu Te
 */

(function(window, document, Object, console, Math, animate) {
	
    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    
    function ChutyChart(id, data, customHeight, customThickness) {
        
        animate(function() {
            _ChutyChart(id, data, customHeight, customThickness);
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
		var height = container.height =  canvas.height = context.canvas.clientHeight = customHeight || 400;
        data = _data.slice(0, 2600);
        data.reverse();
        
        var width = canvas.width = context.canvas.clientWidth = data.length * thickness;
        
		var 
            // open = _getStatistics( data, 'open' ),
			high = _getStatistics( data, 'h' ),
			low = _getStatistics( data, 'l' ),
			// close = _getStatistics( data, 'close' ),
			// volume = _getStatistics( data, 'volume' ),
			min = low.min,
			max = high.max;
		
		var xPos = 0;
		
		context.clearRect(0, 0, width, height);
		context.fillStyle = 'black';
		context.fillRect(0, 0, width, height);
		
		data.forEach(function (datum) {

            _pushDerivedFields(datum);
			_drawCandleStickWick(context, datum, xPos, thickness, min, max, height);
			_drawCandleStickBody(context, datum, xPos, thickness, min, max, height);
			xPos += thickness;
			
		});
        
        container.appendChild(canvas);
        _enableTooltip(canvas, container, thickness, data, context, height, min, max);
        
        container.scrollLeft = container.scrollWidth;
        
	}
    
    var lastMonth = -1;
	function _drawCandleStickBody(context, datum, x, thickness, min, max, height, selected) {
		
		var close = datum.c,
            open = datum.o,
            high = datum.h,
            low = datum.l,
            date = datum.d,
            color = datum.c === datum.o ? 'gray' : (datum.c > datum.o ? 'green' : 'red'),
            isGreen = color === 'green';
		
		context.fillStyle = selected ? 'yellow' : color;
		var top = isGreen ? _normalize(close, min, max, height) : _normalize(open, min, max, height);
		var candleHeight = (isGreen ? _normalize(open, min, max, height) : _normalize(close, min, max, height)) - top;
        ++candleHeight;
		
		context.fillRect(
			x,
			top,
			thickness,
			candleHeight
		);
        
        var dateObject = new Date(date * 1000);
        var currentMonth = dateObject.getMonth();
        
        if ( currentMonth != lastMonth 
             && typeof selected === 'undefined' ) { // once a selected parameter is supplied, it means that this is for the select-deselect portion of the code.
            
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
    
	function _drawCandleStickWick(context, datum, x, thickness, min, max, height, selected) {
		
        var high = datum.h,
            low = datum.l,
            top = _normalize(high, min, max, height),
            height = _normalize(low, min, max, height) - top;
		
		context.fillStyle = selected ? 'yellow' : 'white';
		context.fillRect(
			x + thickness / 2 - 0.5,
			top,
			1,
			height
		);
	}
	
	function _getStatistics(data, map) {
		
        if(data.length === 0) 
            return { min: 0, max: 0 };
        
        var max = data[0][map],
            min = data[0][map];
        
        data.forEach(function(datum){ 
            var current = datum[map];
            if(current > max)
                max = current;
            if(current < min)
                min = current;
        });
        
		return { 
			max : max, min : min
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
    
    function _enableTooltip(canvas, container, thickness, data, context, height, min, max) {
        
        var tooltip = _generateTooltipTemplate();
        
        container.appendChild(tooltip);
        
        var offsetLeft = container.parentNode.offsetLeft,
            offsetTop = container.parentNode.offsetTop,
            halfWidth = container.offsetWidth / 2 + offsetLeft,
            halfHeight = container.offsetHeight / 2; // + offsetTop; // QUIRK: I don't know why it works when offsetTop is excluded.
        
        var lastHash = 0,
            formerIndex = -1,
            total = data.length;
            
        canvas.addEventListener('mousemove', function(e){
            
            var index = Math.round(e.layerX / thickness) - 1;
            
            if (index >= total || index === -1) 
                return false;
            
            var datum = data[index];
            
            var x = (e.pageX - offsetLeft),
                y = (e.pageY - offsetTop);
            
            animate(function() {
                tooltip.style.left = ((x < halfWidth) ? x : (x - tooltip.offsetWidth)) + 'px';
                tooltip.style.top = ((y < halfHeight) ? y : (y - tooltip.offsetHeight)) + 'px';
            });
            
            if (datum.d === lastHash)
                return false;
            
            animate(function() {
                _html(valueClose, datum.c);
                _html(valueOpen, datum.o);
                _html(valueHigh, datum.h);
                _html(valueLow, datum.l);
                _html(valueDate, datum.ds);
                _html(valueVolume, datum.vos);
                _html(valueChange, datum.cs);
                _html(valueValue, datum.vas);

                var color = datum.c === datum.o ? 'gray' : (datum.c > datum.o ? 'green' : 'red');
                tooltip.setAttribute('name', color);
            });
            
            animate(function() {
                // formerly selected candle.
                if(formerIndex !== -1) {
                    var candleOffsetFormer = formerIndex * thickness,
                        formerDatum = data[formerIndex];
                    _drawCandleStickWick(context, formerDatum, candleOffsetFormer, thickness, min, max, height, false);
                    _drawCandleStickBody(context, formerDatum, candleOffsetFormer, thickness, min, max, height, false);
                }
                
                // newly selected candle.
                var candleOffsetNew = index * thickness;
                _drawCandleStickWick(context, datum, candleOffsetNew, thickness, min, max, height, true);
                _drawCandleStickBody(context, datum, candleOffsetNew, thickness, min, max, height, true);
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
        valueValue;
        
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
            value = _generateElement('tr');
           
        var labelClose = _appendChild(close, _generateElement('td'));
        var labelOpen = _appendChild(open, _generateElement('td'));
        var labelHigh = _appendChild(high, _generateElement('td'));
        var labelLow = _appendChild(low, _generateElement('td'));
        var labelDate = _appendChild(date, _generateElement('td'));
        var labelVolume = _appendChild(volume, _generateElement('td'));
        var labelChange = _appendChild(change, _generateElement('td'));
        var labelValue =  _appendChild(value, _generateElement('td'));
        
        _html(labelClose, 'Close');
        _html(labelOpen, 'Open');
        _html(labelHigh, 'High');
        _html(labelLow, 'Low');
        _html(labelDate, 'Date');
        _html(labelVolume, 'Volume');
        _html(labelChange, 'Change');
        _html(labelValue, 'Value');

        valueClose = _appendChild(close, _generateElement('td'));
        valueOpen = _appendChild(open, _generateElement('td'));
        valueHigh = _appendChild(high, _generateElement('td'));
        valueLow = _appendChild(low, _generateElement('td'));
        valueDate = _appendChild(date, _generateElement('td'));
        valueVolume = _appendChild(volume, _generateElement('td'));
        valueChange = _appendChild(change, _generateElement('td'));
        valueValue =  _appendChild(value, _generateElement('td'));
        
        tooltip.className = 'chutyChartTooltip';
        
        _appendChild(tbody, close);
        _appendChild(tbody, open);
        _appendChild(tbody, high);
        _appendChild(tbody, low);
        _appendChild(tbody, date);
        _appendChild(tbody, volume);
        _appendChild(tbody, change); 
        _appendChild(tbody, value);
        _appendChild(tooltip, tbody);
        
        tooltip.id = 'chutyChartTooltip';
        
        tooltip.style.cursor = 'none';
        
        return tooltip;
    }
	
	window.ChutyChart = window.ChutyChart || ChutyChart || function() { console.log('ChutyChart library has encountered a problem!') };
	
})(window, document, Object, console, Math, window.requestAnimationFrame || function(f) { window.setTimeout(f, 0); } );