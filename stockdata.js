

function StockData(ticker, query, callback) {

	var r = new XMLHttpRequest(); 
	r.open('GET', 'stockdata?s=' + ticker 
		+ (query ? ('&q=' + query) : '')
		, true);
	r.onreadystatechange = function () {
		if (r.readyState != 4 || r.status != 200) return;
		var data = JSON.parse(r.responseText);
		callback(data);
	};
	r.send();
	
}

function StockDataTable(id, ticker, query, callback, doWith) {
	
	StockData(ticker, query, function(data) {
        
        doWith(data);
		
        setTimeout(function() {
        
            var contentElement = document.getElementById('content');
            var content = '<thead class="thead-default"><tr><th>Date</th><th>Open</th><th>High</th><th>Low</th><th>Close</th><th>% Change</th><th>Volume</th><th>Value</th></tr></thead><tbody>';
            
            data.forEach( function( datum, index ) {
            
                var close = datum.c,
                    open = datum.o,
                    high = datum.h,
                    low = datum.l,
                    date = datum.d,
                    volume = datum.v;
            
                var change =  Math.round((close - open) / open * 10000) / 100 ;
                var value = Math.round((close + open) / 2 * volume);
                
                content += 
                    '<tr>'
                        + '<td>' + new Date(date * 1000).toLocaleDateString() + '</td>'
                        + '<td>' + open + '</td>'
                        + '<td>' + high + '</td>'
                        + '<td>' + low + '</td>'
                        + '<td>' + close + '</td>'
                        + '<td>' + change + '%</td>'
                        + '<td>' + volume.toLocaleString() + '</td>'
                        + '<td>' + value.toLocaleString() + '</td>'
                    + '</tr>';
            
            });
            
            content += '</tbody>'
            
            contentElement.innerHTML = content;
            
            callback(data);
            
        }, 0);
		
	});
	
}