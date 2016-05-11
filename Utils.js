
var util = require('util');
var extend = require('util-extend');
var bunyan = require('bunyan');
var PrettyStream = require('bunyan-prettystream');
var Q = require('q');

var exports = module.exports = {};


exports.roulette = function(probabilities,rnd)
{
	var idx=0;
	var sum = probabilities[idx],cnt=probabilities.length;
	while (sum < rnd && idx < cnt - 1)
	{
		idx++;
		sum += probabilities[idx];
	}
	return idx;
};

exports.printDate = function(d)
{
	if(!d) d=new Date();
	//YYYY-MM-DDThh:mm:ss
	return d.getFullYear() + '-' +
	  ('0' + (d.getMonth()+1)).slice(-2) + '-' +
	        ('0' +  d.getDate()).slice(-2) + 'T' +
	        ('0' +  d.getHours()).slice(-2) + ':' +
	        ('0' +  d.getMinutes()).slice(-2) + ':' +
	        ('0' +  d.getSeconds()).slice(-2) + '.' +
	        ('0' +  d.getMilliseconds()).slice(-2);
};


exports.createLogger = function createLogger(loggername, level, options)
{
	if (level === undefined)
		level = 'info';
	var loggerOptions = extend({
		useSrc : true,
		useColor : 'auto'
	}, options);
	var prettyStdOut = new PrettyStream({
		useColor : loggerOptions.useColor
	});
	prettyStdOut.pipe(process.stdout);

	var log = bunyan.createLogger({
		name : loggername,
		src : loggerOptions.useSrc, // expensive if true!!!
		streams : [ {
			level : level,
			type : 'raw',
			stream : prettyStdOut
		} ]
	});

	return log;
}


exports.format = function (str, col) {
	col = typeof col === 'object' ? col : Array.prototype.slice.call(arguments, 1);

	return str.replace(/\{\{|\}\}|\{(\w+)\}/g, function (m, n) {
		if (m == "{{") { return "{"; }
		if (m == "}}") { return "}"; }
		return col[n];
	});
};

//choose random element from array 
exports.choose = function choose(ar, rnd)
{
	if (!rnd)
		rnd = Math.random();
	return ar[Math.floor(rnd * ar.length)];
}


exports.mapSeries = function mapSeries(arr, func) 
{
	var currentPromise = Q();
	var promises = arr.map(function (el)
		{
			return currentPromise = currentPromise.then(function ()
			{
				return func(el);
			});
		});
	return Q.all(promises);
}

exports.map = function map(arr, func) 
{
	  return Q().then(function() {
		return arr.map(function(el) { return func(el); });
	}).all()
}


//test driver
if (require.main === module)
{
	var format = exports.format;
	console.log(util.format('hey %s and %s', 'fred', 'ralph'));
	console.log(util.format('hey %s and %s, here is some json: %j', 'fred', 'ralph', {wow: "yeehaw", inc: true, i: 5}));
	util.log(util.format('hey %s and %s, with a timestamp!', 'fred', 'ralph'));
	var log = exports.createLogger('Utils', 'info', {useSrc:true});
	log.info('hi mom!  here is some data: %d', 1.23);
	log.info(format("hi {mom} and {mom} and so-called '{fred}'", {mom:'your mom', fred:'FredRated'}));
	
	var fs = require('fs');
	var fileData = fs.readFileSync('../manifest.yml', 'utf8');
	// fs.writeFileSync(writeSource, "Writing to a file synchronously from node.js", {"encoding":'utf8'});
	log.info('fileData:', fileData);
}


