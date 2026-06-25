import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    age: {
        type: Number
    },
    companies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company"
    }]
});

const User = mongoose.model("User", userSchema);

const companySchema = new mongoose.Schema({
    name:{
        type: String
    },
    address: {
        type: String
    }
})

const Company = mongoose.model("Company", companySchema);

export { User, Company };
