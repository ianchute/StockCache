function StockData(ticker, callback) {

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
      if (xhr.readyState == XMLHttpRequest.DONE) {
          const data = JSON.parse(xhr.responseText)
            .map(({ Date, High, Low, Open, Close, Volume }) => ({ d: Date, h: High, l: Low, o: Open, c: Close, v: Volume }));
          callback(data);
      }
  }
  xhr.open('GET', 'http://stock-cache-server.herokuapp.com/' + ticker, true);
  xhr.send(null);

}

function StockDataTable(id, ticker, callback, doWith) {

  StockData(ticker, function (data) {

    doWith(data);

    setTimeout(function () {

      var contentElement = document.getElementById('content');
      var content = '<thead class="thead-default"><tr><th>Date</th><th>Open</th><th>High</th><th>Low</th><th>Close</th><th>% Change</th><th>Volume</th><th>Value</th></tr></thead><tbody>';

      data.sort(function(a, b) { return b.d - a.d }).forEach(function (datum, index) {

        var close = datum.c,
            open = datum.o,
            high = datum.h,
            low = datum.l,
            date = datum.d,
            volume = datum.v,
            color = datum.c === datum.o ? 'gray' :
            (datum.c > datum.o ? 'green' : 'red');

        var change =  Math.round((close - open) / open * 10000) / 100;
        var value = Math.round((close + open) / 2 * volume);

        content +=
            '<tr name=' + color + '>'
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

      content += '</tbody>';

      contentElement.innerHTML = content;

      callback(data);

    }, 0);

  });

}
