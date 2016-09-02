var fb = {
  "url": "https://stock-2d1d3.firebaseio.com",
  "secret": "Nw6LfnA21cN1DVvdZ73csAEx5OalUPqTGeEcx2ok"
}

var root = new Firebase(fb.url)

function StockData(ticker, callback) {

  root.authWithCustomToken(fb.secret, function() {
    // log
    root.child('logs').push({
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ticker: ticker,
    });

    root.child('stock/' + ticker.toUpperCase()).once('value', function(snap) {
      var data = snap.val()
      var keys = Object.keys(data)
      var transformedData = keys.map(function(key) {
        var datum = data[key];
        datum.d = Number(key);
        return datum;
      });
      callback(transformedData);
    })
  })

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
