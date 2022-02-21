const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    _id: ID!
    username: String!
    email: String
    bookCount: Int
    savedBooks: [Book]
  }

  type Book {
    _id: ID
    bookId: String!
    authors: [String]
    description: String
    title: String!
    image: String
    link: String
  }

  type Query {
    me: User
  }

  type Auth {
    token: ID!
    user: User
  }

  input acceptBook {
    authors: [String]
    description: String!
    bookId: String!
    title: String!
    image: String
    link: String
  }

  type Mutation {
    loginUser(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    saveBook(bookData: acceptBook! ): User
    removeBook(bookId: ID!): User
  }
`;

module.exports = typeDefs;
