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

			_drawCandleStickWick(context, datum, xPos, thickness, min, max, height);
			_drawCandleStickBody(context, datum, xPos, thickness, min, max, height);
			xPos += thickness;
			
		});
		
        container.appendChild(canvas);
        
        container.scrollLeft = container.scrollWidth;
        
	}
    
    var lastMonth = -1;
	function _drawCandleStickBody(context, datum, x, thickness, min, max, height) {
		
		var close = datum.c,
            open = datum.o,
            high = datum.h,
            low = datum.l,
            date = datum.d,
            isGreen = close > open;
		
		context.fillStyle = isGreen ? 'green' : 'red';
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
        
        if ( currentMonth != lastMonth ) {
            
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
	
    
    
	function _drawCandleStickWick(context, datum, x, thickness, min, max, height) {
		
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
		context.fillStyle = '#ffffff';
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
	
	window.ChutyChart = window.ChutyChart || ChutyChart || function() { console.log('ChutyChart library has encountered a problem!') };
	
})(window, document, Object, console, Math);