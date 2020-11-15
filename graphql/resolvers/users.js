const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {UserInputError} = require('apollo-server');

const { SECRET_KEY } = require('../../config');
const User = require('../../models/User');
const { validateRegisterInput, validateLoginInput} = require('../../utils/validators');

function generateToken(user) {
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
    }, SECRET_KEY, { expiresIn: '1h' });
}

module.exports = {
    Query:{
        async getUsers(){
            try{
                const users = await User.find().sort({ username: 1 });
                return users;
            }catch(err){
                console.log(err);
            }
        },
        async getUser(_, { userId }){
            try{
                const user = await User.findById(userId);
                return user;
            }catch(err){
                console.log(err);
            } 
        } 
    },
    Mutation:{
        async login(_, { email, password }){
            const {errors, valid} = validateLoginInput(email, password);
            if(!valid){
                throw new UserInputError('Errors', { errors });
            }

            const user = await User.findOne({ email });
            if(!user){
                errors.general = 'Email not registered!';
                throw new UserInputError('Email not registered', { errors });
            }

            const match = await bcrypt.compare(password, user.password);
            if(!match){
                errors.general = 'Wrong Credentials!';
                throw new UserInputError('Wrong cred', { errors });
            }

            const token = generateToken(user);

            return{
                ...user._doc,
                id: user._id,
                token 
            };
        },
        async register(_, { registerInput: {username, email, password, confirmPassword}}){
            
            const {errors, valid} = validateRegisterInput(username, email, password, confirmPassword);
            if(!valid){
                throw new UserInputError('Errors', { errors });
            }
            const user = await User.findOne({ email });
            if(user){
                throw new UserInputError('Email already exists', {
                    errors:{
                        username: 'Email already exists !'
                    }
                })
            }

            password = await bcrypt.hash(password, 12);

            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString()
            });

            const res = await newUser.save();

            const token = generateToken(res);

            return{
            ...res._doc,
            id: res._id,
            token 
            }
        }
    }
}