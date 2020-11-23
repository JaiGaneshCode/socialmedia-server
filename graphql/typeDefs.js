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

    type Relationship{
        id: ID!
        user: User!
        createdAt: String!
    }

    type User{
        id: ID!
        email: String!
        token: String!
        username: String!
        createdAt: String!
        file: File!
        friends: [Relationship]!
        friendsCount: Int!
        friendRequests: [Relationship]!
        freiendRequestsCount: Int!
        blockedUsers: [Relationship]!
        blockedUsersCount: Int!
    }

    type File {
        id: ID!
        filename: String!
        mimetype: String!
        path: String!
    }

    type Filter{
        searchValue: String
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

    input ModifyUserInput{
        id: ID!
        username: String
        password: String
        confirmPassword: String
        email: String
        file: ID
    }

    type Query{
        getPosts: [Post]
        getPost(postId: ID!): Post
        getUsers(filter: String, userId: ID): [User]
    }

    type Mutation{
        register(registerInput: RegisterInput): User!
        deleteUser(userId: ID!): String!
        login(email: String!, password: String!): User!
        modifyUser(modifyUserInput: ModifyUserInput): User!

        createPost(body: String!): Post!
        deletePost(postId: ID!): String!
        createComment(postId: ID!, body: String!):  Post!
        deleteComment(postId: ID!, commentId: ID!): Post!
        likePost(postId: ID!): Post!

        sendFriendRequest(userId: ID!): User!
        acceptFriendRequest(userId: ID!): User!
        unFriendUser(userId: ID!): User!

        uploadFile(file: Upload!): File
    }
`