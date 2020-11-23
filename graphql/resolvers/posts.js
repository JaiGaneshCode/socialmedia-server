const { AuthenticationError, UserInputError } = require('apollo-server');
const Post = require('../../models/Post');
const User = require('../../models/User');
const checkAuth = require('../../utils/check-auth');

module.exports= {
    Query: {
        async getPosts(){
            try{
                const posts = await Post.find().sort({ createdAt: -1 });
                return posts;
            }catch(err){
                throw new Error(err);
            }
        },
        async getPost(_, { postId }){
            try{
                const post = await Post.findById(postId);
                if(!post){
                    throw new Error('Post not found!');
                }else{
                    return post;
                }
            }catch(err){
                throw new Error(err);
            }
        }
    },
    Mutation:{
        async createPost(_, { body }, context){
            const user = checkAuth(context);
            
            if(body.trim() === ''){
                throw new Error('Post body should not be empty');
            }

            const newPost = new Post({
                body,
                user: user.id,
                createdAt: new Date().toISOString()
            });

            const post = await newPost.save();

            context.pubSub.publish('NEW_POST', {
                newPost: post
            });

            return post;
        },
        async deletePost(_, { postId }, context){
            const user = checkAuth(context);

            try{
                const post = await Post.findById(postId);
                if(user.id == post.user){
                    await post.delete();
                    return 'Post deleted successfully!'
                }else{
                    throw new AuthenticationError('Action not allowed');
                }
            }catch(err){
                throw new Error(err);
            }
        },
        async likePost(_, {postId}, context){
            const {id} = checkAuth(context);

            const post = await Post.findById(postId);
            if(post){
                if(post.likes.find(like => like.user === id)){
                    post.likes = post.likes.filter(like => like.user !== id);
                }else{
                    post.likes.push({
                        user: id,
                        createdAt: new Date().toISOString()
                    })
                }
                await post.save();
                return post;
            }else{
                throw new UserInputError('Post not found');
            }
        }
    },
    Subscription: {
        newPost: {
            subscribe: (_, __, {pubSub}) => pubSub.asyncIterator('NEW_POST')
        }
    }
};