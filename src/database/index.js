import mongoose from "mongoose";
const dotenv = require("dotenv");
dotenv.config();


class Database {
    constructor(){
                
        mongoose
        .connect(process.env.MONGODB_URL)
        .then(()=> console.log("DB Conncection Successfull"))
        .catch((err)=> {
            console.log(err)
        });
    }
    
}


export default new Database()