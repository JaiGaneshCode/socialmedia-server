const postsResolvers = require('./posts');
const usersResolvers = require('./users');
const commentResolvers = require('./comments');
const fileResolvers = require('./fileupload');

const User = require('../../models/User');
const File = require('../../models/File');

module.exports= {

    User: {
        file: async (parent) => await File.findById(parent.file)
    },
    Post: {
        likeCount: (parent) => parent.likes.length,
        commentCount: (parent) => parent.comments.length,
        user: async (parent) => await User.findById(parent.user)
    },
    Comment: {
        user: async (parent) => await User.findById(parent.user)
    },
    Like: {
        user: async (parent) => await User.findById(parent.user)
    },
    Relationship: {
        user: async (parent) => await User.findById(parent.user)
    },
    Query: {
        ...postsResolvers.Query,
        ...usersResolvers.Query
    },
    Mutation: {
        ...usersResolvers.Mutation,
        ...postsResolvers.Mutation,
        ...commentResolvers.Mutation,
        ...fileResolvers.Mutation
    },
    Subscription:{
        ...postsResolvers.Subscription
    }
}