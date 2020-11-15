const { UserInputError, AuthenticationError } = require('apollo-server');
const Post = require('../../models/Post')
const checkAuth = require('../../utils/check-auth')

module.exports = {
    Mutation: {
        createComment: async(_, {postId, body}, context) => {
            const { id } = checkAuth(context);

            if(body.trim() ===""){
                throw new UserInputError('Empty Comment',{
                    errors: {
                        body: 'Comment body should not be empty!'
                    }
                });
            }

            const post = await Post.findById(postId);

            if(post){
                post.comments.unshift({
                    body,
                    user: id,
                    createdAt: new Date().toISOString()
                });

                await post.save();
                return post;
            }else{
                throw new UserInputError('Post not found');
            }
        },
        deleteComment: async(_, {postId, commentId}, context) => {
            const {id} = checkAuth(context);

            const post = await Post.findById(postId);

            if(post){
                const commentIndex = post.comments.findIndex(c => c.id === commentId);

                if(post.comments[commentIndex].user === id){
                    post.comments.splice(commentIndex, 1);
                    await post.save();

                    return post;
                }else{
                    throw new AuthenticationError('Action not allowed');
                }
            }else{
                throw new UserInputError('Post not found');
            }
        }
    }
}