const { AuthenticationError } = require('apollo-server-express'); //import auth
const { User} = require('../models'); //import User model
const { signToken } = require('../utils/auth'); //import sign token form auth

const resolvers = {
    Query: { //get the user
        me: async (parent, args, context) => {
            if(context.user) {
                const userData = await User.findOne({_id: context.user._id})
                .select('-__v -password')
                return userData;
            }
            throw new AuthenticationError('Not logged in');
        },
    },
    Mutation: {
        loginUser: async (parent, {email, password}) => { //authenticate a user to login
            const user = await User.findOne({ email });
            if(!user) { throw new AuthenticationError('User Not Found'); }
            const matchPw = await user.isCorrectPassword(password);
            if(!matchPw) { throw new AuthenticationError('Incorrect Password'); }
            const token = signToken(user);
            return { token, user };
        },
        addUser: async (parent, args) => { //add the a user (signup)
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, { bookData }, context) => {
            if(context.user) {
                //const updateUser = await User.findByIdAndUpdate(
                const updateUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: bookData }},
                    { new: true });
                return updateUser;
            }
            throw new AuthenticationError('Please Log In.');
        },
        removeBook: async (parent, { bookId }, context) => {
            if(context.user) {
                const updateUser = await User.findByIdAndDelete(
                //const updateUser = await User.findOneAndUpdate(
                    { _id: context.user._id},
                    { $pull: { savedBooks: {bookId}}},
                    { new: true });
                return updateUser;
            }
            throw new AuthenticationError('Please Log In.');
        }
    }
};

module.exports = resolvers;
