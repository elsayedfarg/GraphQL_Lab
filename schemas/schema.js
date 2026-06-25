import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLList, GraphQLID, GraphQLError } from "graphql";
import { User, Company } from "../database/models.js";

const companyType = new GraphQLObjectType({
    name: "Company",
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        address: { type: GraphQLString },
        users: {
            type: new GraphQLList(userType),
            resolve: async (parent, args, context) => {
                const usersLoader = context.usersLoader;
                if (!parent._id) return null;
                return await usersLoader.load(parent._id);
            }
        }
    })
});

const userType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        age: { type: GraphQLFloat },
        companies: {
            type: new GraphQLList(companyType),
            resolve: async (parent, args, context) => {
                const companyLoader = context.companyLoader;
                if (!parent.companies || parent.companies.length === 0) {
                    return [];
                }
                return await companyLoader.loadMany(parent.companies);
            }
        }
    })
});

const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "RootQueryType",
        fields: {
            users: {
                type: new GraphQLList(userType),
                resolve: async () => {
                    return await User.find();
                }
            },
            user: {
                type: userType,
                args: { id: { type: GraphQLID } },
                resolve: async (parent, args) => {
                    return await User.findById(args.id);
                }
            },
            companies: {
                type: new GraphQLList(companyType),
                resolve: async () => {
                    return await Company.find();
                }
            },
            company: {
                type: companyType,
                args: { id: { type: GraphQLID } },
                resolve: async (parent, args) => {
                    return await Company.findById(args.id);
                }
            }
        }
    }),
    mutation: new GraphQLObjectType({
        name: "Mutation",
        fields: {
            createUser: {
                type: userType,
                args: {
                    name: { type: GraphQLString },
                    email: { type: GraphQLString },
                    age: { type: GraphQLFloat },
                    companies: { type: new GraphQLList(GraphQLID) }
                },
                resolve: async (parent, args) => {
                    if (args.companies && args.companies.length > 0) {
                        const companiesCount = await Company.countDocuments({ _id: { $in: args.companies } });
                        if (companiesCount !== args.companies.length) {
                            throw new GraphQLError("One or more companies not found");
                        }
                    }
                    return await User.create(args);
                }
            },
            updateUser: {
                type: userType,
                args: {
                    id: { type: GraphQLID },
                    name: { type: GraphQLString },
                    email: { type: GraphQLString },
                    age: { type: GraphQLFloat },
                    companies: { type: new GraphQLList(GraphQLID) }
                },
                resolve: async (parent, args) => {
                    if (args.companies && args.companies.length > 0) {
                        const companiesCount = await Company.countDocuments({ _id: { $in: args.companies } });
                        if (companiesCount !== args.companies.length) {
                            throw new GraphQLError("One or more companies not found");
                        }
                    }
                    return await User.findByIdAndUpdate(args.id, args, { new: true });
                }
            },
            deleteUser: {
                type: userType,
                args: { id: { type: GraphQLID } },
                resolve: async (parent, args) => {
                    return await User.findByIdAndDelete(args.id);
                }
            },
            createCompany: {
                type: companyType,
                args: {
                    name: { type: GraphQLString },
                    address: { type: GraphQLString }
                },
                resolve: async (parent, args) => {
                    return await Company.create(args);
                }
            },
            updateCompany: {
                type: companyType,
                args: {
                    id: { type: GraphQLID },
                    name: { type: GraphQLString },
                    address: { type: GraphQLString }
                },
                resolve: async (parent, args) => {
                    return await Company.findByIdAndUpdate(args.id, args, { new: true });
                }
            },
            deleteCompany: {
                type: companyType,
                args: { id: { type: GraphQLID } },
                resolve: async (parent, args) => {
                    return await Company.findByIdAndDelete(args.id);
                }
            }
        }
    })
});

export default schema;
