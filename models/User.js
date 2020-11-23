const {model, Schema} = require('mongoose');

const userSchema = new Schema({
    username: String,
    password: String,
    email: String,
    createdAt: String,
    file:{
        type: Schema.Types.ObjectId,
        ref: 'File'
    },
    friends: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: String
    }],
    friendRequests: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: String
    }],
    blockedUsers:[{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: String
    }]
});

module.exports = model('User', userSchema);
