const {model, Schema} = require('mongoose');

const postSchema = new Schema({
    body: String,
    createdAt: String,
    comments: [
        {
            body: String,
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            createdAt: String
        }
    ],
    likes: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            createdAt: String
        }
    ],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = model('Post', postSchema);