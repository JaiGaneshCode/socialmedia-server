const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError, AuthenticationError } = require("apollo-server");

const { SECRET_KEY } = require("../../config");
const User = require("../../models/User");
const File = require("../../models/File");
const {
    validateRegisterInput,
    validateLoginInput,
} = require("../../utils/validators");
const checkAuth = require("../../utils/check-auth");

function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            username: user.username,
        },
        SECRET_KEY,
        { expiresIn: "1h" }
    );
}

module.exports = {
    Query: {
        async getUsers(_, { filter, userId }, context) {
            const authUser = checkAuth(context);

            try {
                let users = [];
                if (userId) {
                    users.push(
                        await User.findById(userId)
                    );
                } else if (filter) {
                    users = (await User.find()).filter(
                        (user) =>
                            user.username
                                .toLowerCase()
                                .indexOf(filter.toLowerCase()) !== -1 &&
                            user.id != authUser.id
                    )
                } else {
                    users = (await User.find()).filter(user => user.id != authUser.id);
                }
                return users;
            } catch (err) {
                console.log(err);
            }
        },
    },
    Mutation: {
        async login(_, { email, password }) {
            const { errors, valid } = validateLoginInput(email, password);
            if (!valid) {
                throw new UserInputError("Errors", { errors });
            }

            const user = await User.findOne({ email });
            if (!user) {
                errors.general = "Email not registered!";
                throw new UserInputError("Email not registered", { errors });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                errors.general = "Wrong Credentials!";
                throw new UserInputError("Wrong cred", { errors });
            }

            const token = generateToken(user);

            return {
                ...user._doc,
                id: user._id,
                token,
            };
        },
        async register(
            _,
            { registerInput: { username, email, password, confirmPassword } }
        ) {
            const { errors, valid } = validateRegisterInput(
                username,
                email,
                password,
                confirmPassword
            );
            if (!valid) {
                throw new UserInputError("Errors", { errors });
            }
            const user = await User.findOne({ email });
            if (user) {
                throw new UserInputError("Email already exists", {
                    errors: {
                        username: "Email already exists !",
                    },
                });
            }

            password = await bcrypt.hash(password, 12);

            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString(),
            });
            const res = await newUser.save();

            const token = generateToken(res);

            return {
                ...res._doc,
                id: res._id,
                token,
            };
        },
        async deleteUser(_, { userId }, context) {
            const { id } = checkAuth(context);

            if (id === userId) {
                const user = await User.findById(userId);
                await user.delete();
                return "User deleted successfully !";
            } else {
                throw new AuthenticationError("Action not allowed");
            }
        },
        async modifyUser(_, { modifyUserInput: { id: userId, username, email, file, password, confirmPassword } }, context){
            const { id } = checkAuth(context);

            if(id == userId){
                const user = await User.findById(userId);
                if(username && username.trim() != ''){
                    user.username = username
                }
                if(email && email.trim() != ''){
                    const emailUser = await User.findOne({email});
                    if(emailUser && emailUser.email != user.email){
                        throw new UserInputError("Entered existing email !");
                    }
                    user.email = email;
                }
                if(file && file.trim() != ''){
                    const fileObj = await File.findById(file);
                    if(fileObj){
                        user.file=file
                    }
                }
                if(password && password.trim() != ''){
                    if(password == confirmPassword){
                        password = await bcrypt.hash(password, 12);
                        user.password = password;
                    }else{
                        throw new UserInputError("Password and Confirm Password must match!")
                    }
                }
                await user.save();

                const token = generateToken(user);

                return {
                    ...user._doc,
                    id: user._id,
                    token,
                };
            }else{
                throw new AuthenticationError("Action not allowed");
            }
        },
        async sendFriendRequest(_, { userId }, context) {
            const { id } = checkAuth(context);

            if (id == userId) {
                throw new UserInputError("Friend Request to self");
            }

            const user = await User.findById(userId);
            if (user) {
                const friend = user.friends.find(
                    (friend) => friend.user == userId
                );
                if (friend) {
                    throw new UserInputError("UserID already Friend !");
                }

                const blocked = user.blockedUsers.find(
                    (blocked) => blocked.user == id
                );
                if (blocked) {
                    throw new UserInputError("UserID has blocked you !");
                }

                const myExtn = await User.findById(id);
                const youBlocked = myExtn.blockedUsers.find(
                    (blocked) => blocked.user == userId
                );
                if (youBlocked) {
                    throw new UserInputError("You have blocked the UserID !");
                }

                const oldrequest = user.friendRequests.find(
                    (request) => request.user == id
                );
                if (oldrequest) {
                    throw new UserInputError("Already sent request");
                }

                user.friendRequests.push({
                    user: id,
                    createdAt: new Date().toISOString(),
                });
                await user.save();
                return user;
            } else {
                throw new UserInputError("UserID doesnt Exists !");
            }
        },
        async acceptFriendRequest(_, { userId }, context) {
            const { id } = checkAuth(context);

            const user = await User.findById(id);
            const requestUser = await User.findById(userId);

            if (user.friendRequests.find((request) => request.user == userId)) {
                user.friendRequests = user.friendRequests.filter(
                    (request) => request.user != userId
                );
                requestUser.friendRequests = requestUser.friendRequests.filter(
                    (request) => request.user != id
                );
                if (!user.friends.find((friend) => friend.user == userId)) {
                    user.friends.push({
                        user: userId,
                        createdAt: new Date().toISOString(),
                    });
                }
                if (!requestUser.friends.find((friend) => friend.user == id)) {
                    requestUser.friends.push({
                        user: id,
                        createdAt: new Date().toISOString(),
                    });
                }

                await requestUser.save();
                await user.save();

                return user;
            } else {
                throw new UserInputError("No request from the UserID !");
            }
        },
        async unFriendUser(_, { userId }, context){
            const { id } = checkAuth(context);

            const authUser = await User.findOne({ id });
            const requestUser = await User.findOne({ id: userId });

            authUser.friends = authUser.friends.filter(friend => friend.user != userId);
            requestUser.friends = requestUser.friends.filter(friend => friend.user != id);

            await authUser.save();
            await requestUser.save();

            return authUser;
        }
    },
};
