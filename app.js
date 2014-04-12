
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var request = require('request');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/fanschecker');

var Fans = mongoose.model('Fans', { 
    pageId: String,
    likes: Number,
    createdAt: { type: Date, default: Date.now },
});

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
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

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

var pageId = '310212962461242';
var url = 'http://graph.facebook.com/' + pageId;

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
}, 30000);