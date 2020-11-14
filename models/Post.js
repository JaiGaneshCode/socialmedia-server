const {model, Schema} = require('mongoose');

const postSchema = new Schema({
    body: String,
    createdAt: String,
    comments: [
        {
            body: String,
            user: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            },
            createdAt: String
        }
    ],
    likes: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            },
            createdAt: String
        }
    ],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    }
});

module.exports = model('Post', postSchema);