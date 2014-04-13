var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment-timezone');

var FansSchema = new Schema({ 
    pageId: String,
    likes: Number,
    createdAt: { 
        type: Date, 
        default: Date.now ,
        index: true
    },
});
FansSchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj._id;
    delete obj.__v;
    obj.createdAt = moment(obj.createdAt).tz('Asia/Taipei').format();
    return obj;
}

exports.Fans = mongoose.model('Fans', FansSchema);

