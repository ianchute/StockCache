<?php

    /*
     *	Philippine Stock Data API
     *  By: Ian Herve U. Chu Te
     */

    ob_start('ob_gzhandler');

    if (!@fsockopen('www.investagrams.com', 80, $errno, $errstr, 2)) {
        echo json_encode(['error' => 'Unable to contact source server.']);
        exit;
    }

    if (!isset($_GET['s'])) {
        echo json_encode(['error' => 'Missing parameter.']);
        exit;
    }

    // require_once 'PHPLinq.php';
    // require_once 'PHPLinq/LinqToObjects.php';

    header('Content-type: application/json');

    function sanitize($word)
    {
        return strtolower(preg_replace('/[^a-z0-9]+/i', '-', $word));
    }

    function timestampToDateTime($timestamp)
    {
        $dt = new DateTime();
        $dt->setTimezone(new DateTimeZone('Asia/Manila'));
        $dt->setTimestamp($timestamp);

        return $dt;
    }

    $ip = '';

    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
        $ip = $_SERVER['REMOTE_ADDR'];
    }

    $curl = curl_init();

    $symbol = sanitize($_GET['s']);

    if (strpos($symbol, '-') !== false) {
        echo json_encode(['error' => 'Invalid parameter.']);
        exit;
    }

    $resolution = 'D';
    $fromDate = '725068800'; // PSE Epoch.
    $toDate = (string) time();
    $session = 's11dckge2czjz2ow3lsagjy4';

    $header[] = 'Host: www.investagrams.com';
    $header[] = 'Connection: keep-alive';
    $header[] = 'Accept: application/json, text/javascript, */*; q=0.01';
    $header[] = 'Origin: https://www.investagrams.com';
    $header[] = 'X-Requested-With: XMLHttpRequest';
    $header[] = 'Content-Type: application/json; charset=UTF-8';
    $header[] = 'Accept-Encoding: gzip, deflate';
    $header[] = 'Accept-Language: en-US,en;q=0.8';

    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, $header);
    curl_setopt($curl, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36');
    curl_setopt($curl, CURLOPT_URL, 'https://www.investagrams.com/WebService/TradingViewChartWebService.aspx/history');
    curl_setopt($curl, CURLOPT_REFERER, 'https://www.investagrams.com/Stock/'.$symbol);
    curl_setopt($curl, CURLOPT_COOKIE, 'ASP.NET_SessionId='.$session);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

    $data = array(
        'symbol' => $symbol,
        'resolution' => $resolution,
        'from' => $fromDate,
        'to' => $toDate,
    );

    curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));

    $raw = curl_exec($curl);

    $result =
        json_decode(
            json_decode($raw)->d
        );

    curl_close($curl);

    $t = $result->t;
    $o = $result->o;
    $h = $result->h;
    $l = $result->l;
    $c = $result->c;
    $v = $result->v;

    if (
        count(
            array_unique(
                array(
                    count($t),
                    count($o),
                    count($h),
                    count($c),
                    count($v),
        ))) != 1) {
        echo json_encode(['error' => 'Data from source server is corrupted.']);
        exit; // Check if all arrays are of same size.
    }

    $count = count($t);

    for ($i = 0; $i < $count; ++$i) {
        $parsedResult[] = (object) array(
            'd' => $t[$i],
            'o' => $o[$i],
            'h' => $h[$i],
            'l' => $l[$i],
            'c' => $c[$i],
            'v' => $v[$i],
        );
    }

    if (isset($_GET['q'])) {
        $query = $_GET['q'];
        $query = str_replace('(', 'new DateTime(\'', $query);
        $query = str_replace(')', '\')', $query);
        $query = str_replace(',', '&&', $query);
        $query = str_replace('|', '||', $query);
        $query = str_replace('=', '==', $query);
        $query = str_replace('@date', 'timestampToDateTime($p->date)', $query);
        $query = str_replace('@', '$p->', $query);

        $parsedResult = from('$p')->in($parsedResult)
            ->where('$p => '.$query)
            ->select('$p');
    }

    echo json_encode(array_reverse($parsedResult));
