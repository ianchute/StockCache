/*
 *  ChutyChart
 *  A stock data graphing and analysis library.
 *  By: Ian Herve U. Chu Te
 */

(function(window, document, Object, console, Math) {
	
    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    
    function ChutyChart(id, data, customHeight, customThickness) {
        
        setTimeout(function() {
            _ChutyChart(id, data, customHeight, customThickness);
        }, 0);
        
    }
    
	function _ChutyChart(id, _data, customHeight, customThickness) {
        
		var container = document.getElementById(id);
        var canvas = document.createElement('canvas');
        
        container.innerHTML = '';
        container.style.overflowX = 'scroll';
        container.style.cursor = 'none';
        
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
            isGreen = close > open;
		
		context.fillStyle = isGreen ? (selected ? 'teal' : 'green') : (selected ? 'orange' : 'red');
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
            context.fillStyle = 'blue';
            context.fillRect(
                x,
                0,
                1,
                height
            );
            
            context.font = 'Lato';
            context.fillText(MONTHS[currentMonth] + ' ' + currentYear, x + 10, 10);
        }
        
        lastMonth = currentMonth;
		
	}
    
	function _drawCandleStickWick(context, datum, x, thickness, min, max, height, selected) {
		
        var close = datum.c,
            open = datum.o,
            high = datum.h,
            low = datum.l,
            isGreen = close > open,
            top = _normalize(high, min, max, height),
            height1 = (isGreen ? _normalize(close, min, max, height) : _normalize(open, min, max, height)) - top,
            bottom = _normalize(isGreen ? open : close, min, max, height),
            height2 = _normalize(low, min, max, height) - bottom;
		
        // Top wick.
		context.fillStyle = selected ? 'yellow' : 'white';
		context.fillRect(
			x + thickness / 2 - 0.5,
			top,
			1,
			height1
		);
		
		// Bottom wick.
		context.fillRect(
			x + thickness / 2 - 0.5,
			bottom,
			1,
			height2
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
        datum.dateString = new Date(datum.d * 1000).toLocaleDateString(),
        datum.volumeString = datum.v.toLocaleString(),
        datum.changeString = Math.round((datum.c - datum.o) / datum.o * 10000) / 100 + '%',
        datum.valueString = (Math.round((datum.c + datum.o) / 2 * datum.v)).toLocaleString();
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
            
            setTimeout(function() {
                tooltip.style.left = ((x < halfWidth) ? x : (x - tooltip.offsetWidth)) + 'px';
                tooltip.style.top = ((y < halfHeight) ? y : (y - tooltip.offsetHeight)) + 'px';
            }, 0);
            
            if (datum.d === lastHash)
                return false;
            
            setTimeout(function() {
                valueClose.innerHTML = datum.c,
                valueOpen.innerHTML = datum.o,
                valueHigh.innerHTML = datum.h,
                valueLow.innerHTML = datum.l,
                valueDate.innerHTML = datum.dateString,
                valueVolume.innerHTML = datum.volumeString,
                valueChange.innerHTML = datum.changeString,
                valueValue.innerHTML = datum.valueString;

                var name = datum.c === datum.o ? 'blue' : (datum.c > datum.o ? 'green' : 'red');
                tooltip.setAttribute('name', name);
            }, 0);
            
            setTimeout(function() {
                // formerly selected candle.
                if(formerIndex !== -1) {
                    var candleOffsetFormer = formerIndex * thickness,
                        formerDatum = data[formerIndex];
                    _drawCandleStickBody(context, formerDatum, candleOffsetFormer, thickness, min, max, height, false);
                    _drawCandleStickWick(context, formerDatum, candleOffsetFormer, thickness, min, max, height, false);
                }
                
                // newly selected candle.
                var candleOffsetNew = index * thickness;
                _drawCandleStickBody(context, datum, candleOffsetNew, thickness, min, max, height, true);
                _drawCandleStickWick(context, datum, candleOffsetNew, thickness, min, max, height, true);
                formerIndex = index;
            }, 0);
            
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
    
    function _generateTooltipTemplate() {
        
        var tooltip = document.createElement('table'),
            tbody = document.createElement('tbody'),
            close = document.createElement('tr'),
            open = document.createElement('tr'),
            high = document.createElement('tr'),
            low = document.createElement('tr'),
            date = document.createElement('tr'),
            volume = document.createElement('tr'),
            change = document.createElement('tr'),
            value = document.createElement('tr');
           
        var labelClose = close.appendChild(document.createElement('td'));
        var labelOpen = open.appendChild(document.createElement('td'));
        var labelHigh = high.appendChild(document.createElement('td'));
        var labelLow = low.appendChild(document.createElement('td'));
        var labelDate = date.appendChild(document.createElement('td'));
        var labelVolume = volume.appendChild(document.createElement('td'));
        var labelChange = change.appendChild(document.createElement('td'));
        var labelValue =  value.appendChild(document.createElement('td'));
        
        labelClose.innerHTML = '<b>Close</b>';
        labelOpen.innerHTML = '<b>Open</b>';
        labelHigh.innerHTML = '<b>High</b>';
        labelLow.innerHTML = '<b>Low</b>';
        labelDate.innerHTML = '<b>Date</b>';
        labelVolume.innerHTML = '<b>Volume</b>';
        labelChange.innerHTML = '<b>Change</b>';
        labelValue.innerHTML = '<b>Value</b>';

        valueClose = close.appendChild(document.createElement('td'));
        valueOpen = open.appendChild(document.createElement('td'));
        valueHigh = high.appendChild(document.createElement('td'));
        valueLow = low.appendChild(document.createElement('td'));
        valueDate = date.appendChild(document.createElement('td'));
        valueVolume = volume.appendChild(document.createElement('td'));
        valueChange = change.appendChild(document.createElement('td'));
        valueValue =  value.appendChild(document.createElement('td'));
        
        tooltip.className = 'chutyChartTooltip';
        
        tbody.appendChild(close);
        tbody.appendChild(open);
        tbody.appendChild(high);
        tbody.appendChild(low);
        tbody.appendChild(date);
        tbody.appendChild(volume);
        tbody.appendChild(change); 
        tbody.appendChild(value);
        tooltip.appendChild(tbody);
        
        tooltip.id = 'chutyChartTooltip';
        
        return tooltip;
    }
	
	window.ChutyChart = window.ChutyChart || ChutyChart || function() { console.log('ChutyChart library has encountered a problem!') };
	
})(window, document, Object, console, Math);