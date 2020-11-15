const { gql } = require('apollo-server');

module.exports= gql`
    type Post{
        id: ID!
        body: String!
        createdAt: String!
        user: User!
        comments:[Comment]!
        likes:[Like]!
        likeCount: Int!
        commentCount: Int!
    }

    type Comment{
        id: ID!
        createdAt: String!,
        user: User!
        body: String!
    }

    type Like{
        id: ID!
        createdAt: String!
        user: User!
    }

    type User{
        id: ID!
        email: String!
        token: String!
        username: String!
        createdAt: String!
    }

    type Subscription{
        newPost: Post!
    }

    input RegisterInput{
        username: String!
        password: String!
        confirmPassword: String!
        email: String!
    }

    type Query{
        getPosts: [Post]
        getPost(postId: ID!): Post
        getUsers: [User]
        getUser(userId: ID!): User
    }

    type Mutation{
        register(registerInput: RegisterInput): User!
        login(email: String!, password: String!): User! 
        createPost(body: String!): Post!
        deletePost(postId: ID!): String!
        createComment(postId: ID!, body: String!):  Post!
        deleteComment(postId: ID!, commentId: ID!): Post!
        likePost(postId: ID!): Post!
    }
`