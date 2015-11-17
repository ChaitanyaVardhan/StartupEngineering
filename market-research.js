#!/usr/bin/env node

var util = require('util');
var fs = require('fs');
var rest = require('restler');
var csv = require('csv');
var accounting = require('accounting');
var CSVFILE_DEFAULT = "market-research.csv";
var SYMBOLS_DEFAULT = ["GOOG", "FB", "APPL", "YHOO", "MSFT", "LNKD", "CRM"];
var COLUMNS_DEFAULT = 'snj1pr';
var HEADERS_DEFAULT = ["Symbol", "Name", "Market Cap", "Previous Close Price", "P/E Ratio", "Shares", "EPS", "Earnings"];

var marketResearch = function(symbols, column, csvfile, headers) {
    symbols = symbols || SYMBOLS_DEFAULT;
    columns = columns || COLUMNS_DEFAULT;
    csvfile = csvfile || CSVFILE_DEFAULT;
    headers = headers || HEADERS_DEFAULT;
    var apiurl = financeurl(symbols, columns);
    var response2console = buildfn(csvfile, headers);
    rest.get(apiurl).on('complete', response2console);
};

var buildfn = function(csvfile, headers) {
    var response2console = function(result, response) {
	if(result instanceof Error) {
	    console.error('Error: ' + util.format(response.message));
	    } else {
		console.error("Wrote %s", csvfile);
		fs.writeFileSync(csvfile, result);
		csv2console(csvfile, headers);
}
};
return response2console;
};

var csv2console = function(csvfile, headers) {
    console.log(headers.join("\t"));
    csv()
    .from.path(csvfile)
    .on('record', function(row, index) {
	var shares = Math.round(marketCapFloat(row[2])/row[3],0);
	var eps = (row[3]/row[4]).toFixed(3);
	var earnings = accounting.formatMoney(eps * shares);
	outrow = row.concat([shares, eps, earnings]);
	console.log(outrow.join("\t"));
});
};

var financeurl = function(symbols, columns) {
    return util.format(
	'http://finance.yahoo.com/d/quotes.csv?s=%s&f=%s',
	symbols.join('+'),
	columns);
};

var marketCapFloat = function(marketCapString) {
    return parseFloat(marketCapString.split('B')[0]) * 1e9;
};

if(require.main == module) {
    console.error('Invoked at command line.');
    var symbols = processs.argv;
    if(symbols.length > 2) {
	symbols = symbols.slice(2,symbols.length);
    } else {
	symbols = undefined;
    }
    marketResearch(symbols);
} else {
    console.error('Invoked via library call');
}

exports.marketResearch = marketResearch;
