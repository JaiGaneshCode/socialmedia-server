const postsResolvers = require('./posts');
const usersResolvers = require('./users');
const commentResolvers = require('./comments');

const User = require('../../models/User');

module.exports= {
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
    Query: {
        ...postsResolvers.Query,
        ...usersResolvers.Query
    },
    Mutation: {
        ...usersResolvers.Mutation,
        ...postsResolvers.Mutation,
        ...commentResolvers.Mutation
    },
    Subscription:{
        ...postsResolvers.Subscription
    }
}