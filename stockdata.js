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

function StockDataTable(id, ticker, query, callback) {
	
	
	StockData(ticker, query, function(data) {
		
        setTimeout(function() {
        
            var contentElement = document.getElementById('content');
            var content = '<thead id="headers" class="thead-default"><tr><th>Date</th><th>Open</th><th>High</th><th>Low</th><th>Close</th><th>Volume</th></tr></thead><tbody>';
            
            data.forEach( function( datum, index ) {
            
                content += 
                    '<tr>'
                        + '<td>' + new Date(datum.date * 1000).toLocaleDateString() + '</td>'
                        + '<td>' + datum.open + '</td>'
                        + '<td>' + datum.high + '</td>'
                        + '<td>' + datum.low + '</td>'
                        + '<td>' + datum.close + '</td>'
                        + '<td>' + datum.volume + '</td>'
                    + '</tr>';
            
            });
            
            content += '</tbody>'
            
            contentElement.innerHTML = content;
            
            callback(data);
            
        }, 0);
		
	});
	
}