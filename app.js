
/**
 * Module dependencies.
 */
require('newrelic');

var express = require('express');
var routes = require('./routes');

var http = require('http');
var path = require('path');

var moment = require('moment-timezone');
var request = require('request');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

process.env.TZ = 'Asia/Taipei';

// Here we find an appropriate database to connect to, defaulting to
// localhost if we don't find one.
var uristring =
    process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://localhost/fanschecker';

// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(uristring, function (err, res) {
    if (err) {
        console.log ('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log ('Succeeded connected to: ' + uristring);
    }
});

var FansSchema = new Schema({ 
    pageId: String,
    likes: Number,
    createdAt: { type: Date, default: Date.now },
});
FansSchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj._id;
    delete obj.__v;
    obj.createdAt = moment(obj.createdAt).tz('Asia/Taipei').format();
    return obj;
}
var Fans = mongoose.model('Fans', FansSchema);

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', function(req, res) {
    res.render('index');
});
app.get('/chart', function(req, res) {
    res.render('chart'); 
});

app.get('/api/fans', function(req, res) {
    var skip = req.query.skip ;
    var limit = req.query.limit;
    var start = new Date(req.query.start);
    var end = new Date(req.query.end);

    console.log(start, end);

    if (!skip) skip = 0;
    if (!limit) limit = 1000;

    var query = {};
    var dateFilter = {};
    if (start && start != 'Invalid Date') {
        dateFilter['$gte'] = start;
    }
    if (end && end != 'Invalid Date') {
        dateFilter['$lt'] = end;
    }
    if (dateFilter['$get'] || dateFilter['$lt'])
        query['createdAt'] = dateFilter;

    Fans
    .find(query)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .exec(function(err, result) {
        var previous = undefined;

        if (result.length ) {
            var date = moment(result[result.length - 1].createdAt).tz('Asia/Taipei').format();
            previous = req.protocol + '://' + req.get('host') + '/api/fans?limit=' + limit + '&end=' + encodeURIComponent(date);
        }

        res.json({
            options: {
                start: req.query.start,
                end: req.query.end,
                skip: skip,
                limit: limit,
            },
            previous: previous,
            size: result.length,
            result: result,
        });
    });
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

var pageId = '310212962461242';
var url = 'http://graph.facebook.com/' + pageId;
var sampleRate = 60 * 1000;

setInterval(function(){
    var r = request.get(url, function(err, res, body) {
        var body = JSON.parse(body);
        console.log(new Date(), 'likes:', body.likes);

        var fans = new Fans({ 
            likes: parseInt(body.likes) 
        });
        fans.save(function (err) {
            if (err) {
                console.log('err:', err);
            }
        });
    });
}, sampleRate);
