const { AuthenticationError } = require('apollo-server-express'); //import auth
const { User} = require('../models'); //import User model
const { signToken } = require('../utils/auth'); //import sign token form auth

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if(context.user) {
                const userData = await User.findOne({_id: context.user._id})
                .select('-__v -password')
                .populate('saveBook');
                return userData;
            }
            throw new AuthenticationError('Not logged in');
        }
    },
    Mutation: {
        loginUser: async (parent, {email, password}) => {
            const user = await User.findOne({ email });
            if(!user) { throw new AuthenticationError('User Not Found'); }
            const matchPw = await user.isCorrectPasword(password);
            if(!matchPw) { throw new AuthenticationError('Incorrect Password'); }
            const toke = signToken(user);
            return { token, user };
        },
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, args, context) => {
            if(context.user) {
                const updateBook = await User.create({ ...args, username: context.user.username });
                await User.findByIdAndUpdate(
                    { _id: context.user._id},
                    { $push: { saveBook: book}},
                    { new: true });
                return updateBook;
            }
            throw new AuthenticationError('Please Log In.');
        },
        removeBook: async (parent, args, context) => {
            if(context.user) {
                const userData = await User.create({ ...args, username: context.user.username });
                await User.findByIdAndDelete(
                    { _id: context.user._id},
                    { $pull: { saveBook: bookId}},
                    { new: true });
                return userData;
            }
        }
    }

};

module.exports = resolvers;


//   async getSingleUser({ user = null, params }, res) {
//     const foundUser = await User.findOne({
//       $or: [{ _id: user ? user._id : params.id }, { username: params.username }],
//     });

//     if (!foundUser) {
//       return res.status(400).json({ message: 'Cannot find a user with this id!' });
//     }

//     res.json(foundUser);
//   },
//   // create a user, sign a token, and send it back (to client/src/components/SignUpForm.js)
//   async createUser({ body }, res) {
//     const user = await User.create(body);

//     if (!user) {
//       return res.status(400).json({ message: 'Something is wrong!' });
//     }
//     const token = signToken(user);
//     res.json({ token, user });
//   },
//   // login a user, sign a token, and send it back (to client/src/components/LoginForm.js)
//   // {body} is destructured req.body
//   async login({ body }, res) {
//     const user = await User.findOne({ $or: [{ username: body.username }, { email: body.email }] });
//     if (!user) {
//       return res.status(400).json({ message: "Can't find this user" });
//     }

//     const correctPw = await user.isCorrectPassword(body.password);

//     if (!correctPw) {
//       return res.status(400).json({ message: 'Wrong password!' });
//     }
//     const token = signToken(user);
//     res.json({ token, user });
//   },
//   // save a book to a user's `savedBooks` field by adding it to the set (to prevent duplicates)
//   // user comes from `req.user` created in the auth middleware function
//   async saveBook({ user, body }, res) {
//     console.log(user);
//     try {
//       const updatedUser = await User.findOneAndUpdate(
//         { _id: user._id },
//         { $addToSet: { savedBooks: body } },
//         { new: true, runValidators: true }
//       );
//       return res.json(updatedUser);
//     } catch (err) {
//       console.log(err);
//       return res.status(400).json(err);
//     }
//   },
//   // remove a book from `savedBooks`
//   async deleteBook({ user, params }, res) {
//     const updatedUser = await User.findOneAndUpdate(
//       { _id: user._id },
//       { $pull: { savedBooks: { bookId: params.bookId } } },
//       { new: true }
//     );
//     if (!updatedUser) {
//       return res.status(404).json({ message: "Couldn't find user with this id!" });
//     }
//     return res.json(updatedUser);
//   },
// };
