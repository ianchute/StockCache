/*
 *	ChutyChart
 *	A stock data graphing and analysis library.
 *  By: Ian Herve U. Chu Te
 */

(function() {
	
	if( !Enumerable )
		throw 'Enumerable must be defined for chutychart.js to work!';
	
	const MAP = {
		
		open : '_ => _.open',
		high : '_ => _.high',
		low : '_ => _.low',
		close : '_ => _.close',
		volume : '_ => _.volume'
		
	};
	
	function ChutyChart(id, data) {
		
		var canvas = document.getElementById(id);
		var context = canvas.getContext('2d');
		var height = context.canvas.clientHeight;
		var width = context.canvas.clientWidth;
		var thickness = width / data.length;
		
		var open = _getStatistics( data, MAP.open ),
			high = _getStatistics( data, MAP.high ),
			low = _getStatistics( data, MAP.low ),
			close = _getStatistics( data, MAP.close ),
			volume = _getStatistics( data, MAP.volume ),
			min = low.min,
			max = high.max;
		
		var xPos = 0;
		
		context.clearRect(0, 0, width, height);
		context.fillStyle = 'black';
		context.fillRect(0, 0, width, height);
		
		data.forEach(function (datum) {
			
			_drawCandleStickBody(context, datum, xPos, thickness, min, max, height);
			_drawCandleStickWick(context, datum, xPos, thickness, min, max, height);
			xPos += thickness;
			
		});
		
		_flip(context);
	
	}
	
	function _drawCandleStickBody(context, datum, x, thickness, min, max, height) {
		
		var isGreen = datum.close > datum.open;
		
		context.fillStyle = isGreen ? 'green' : 'red';
		var top = isGreen ? _normalize(datum.close, min, max, height) : _normalize(datum.open, min, max, height);
		var height = (isGreen ? _normalize(datum.open, min, max, height) : _normalize(datum.close, min, max, height)) - top;
		
		context.fillRect(
			x,
			top,
			thickness,
			height + 1
		);
		
	}
	
	function _drawCandleStickWick(context, datum, x, thickness, min, max, height) {
		
		// Top wick.
		
		var isGreen = datum.close > datum.open;
		var top = _normalize(datum.high, min, max, height);
		var height1 = (isGreen ? _normalize(datum.close, min, max, height) : _normalize(datum.open, min, max, height)) - top;
		
		context.fillStyle = 'white';
		context.fillRect(
			x + thickness / 2 - 0.5,
			top,
			1,
			height1
		);
		
		// Bottom wick.
		
		var bottom = _normalize(datum.close > datum.open ? datum.open : datum.close, min, max, height);
		var height2 = _normalize(datum.low, min, max, height) - bottom;
		
		context.fillRect(
			x + thickness / 2 - 0.5,
			bottom,
			1,
			height2
		);
		
	}
	
	function _getStatistics(data, map) {
		
		return { 
			max : Enumerable.From( data ).Max( map ), 
			min : Enumerable.From( data ).Min( map )
		};
		
	}
	
	function _normalize(quantity, min, max, height) {
		
		return (quantity - min) / (max - min) * height;
		
	}
	
	function _flip( context ) {
		
		var height = context.canvas.clientHeight;
		
		var url = context.canvas.toDataURL();
		var img = document.createElement('img');
		img.src = url;
		context.save();
		context.scale(1, -1);
		context.drawImage(img, 0, -height);
		context.restore();
		
	}
	
	window.ChutyChart = window.ChutyChart || ChutyChart || {};
	
})();