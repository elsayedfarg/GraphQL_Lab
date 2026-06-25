import DataLoader from "dataloader";
import { Company, User } from "../database/models.js";

const companyLoader = new DataLoader(async (companyIds) => {
    const companies = await Company.find({ _id: { $in: companyIds } });
    return companyIds.map(id => companies.find(company => company._id.toString() === id.toString()));
});

const usersLoader = new DataLoader(async (companyIds) => {
    const users = await User.find({ companies: { $in: companyIds } });
    return companyIds.map(companyId => users.filter(user => user.companies && user.companies.map(c => c.toString()).includes(companyId.toString())));
});

export { companyLoader, usersLoader };
