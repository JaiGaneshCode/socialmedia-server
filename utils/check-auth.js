const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const { AuthenticationError} = require('apollo-server');

module.exports = (context) => {
    //context = {... headers}
    const authHeader = context.req.headers.authorization;
    if(authHeader){
        //Bearer ...
        const token = authHeader.split('Bearer ')[1];
        if(token){
            try{
                const user = jwt.verify(token, SECRET_KEY);
                return user;
            }catch(err){
                throw new AuthenticationError('Invalid/Epired Token');
            }
        }
        throw new Error('Token not proper');
    }
    throw new Error('Authorization  header must be provided');

}