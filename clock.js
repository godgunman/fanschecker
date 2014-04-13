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
