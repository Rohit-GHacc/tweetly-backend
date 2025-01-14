import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    name:{
        type : String,
        required:true
    },
    username:{
        type : String,
        required:true,
        unique: true
    },
    email:{
        type : String,
        required:true,
        unique: true
    },
    password:{
        type : String,
        required:true
    },
    followers:{
        type:Array,
        default: []
    },
    following:{
        type:Array,
        default: []
    },
    bookmarks:{
        type : Array,
        default: []
    },
    // profileImage: { 
    //     type: String, 
    //     default: process.env.DEFAULT_PROFILE_IMAGE },
},{timestamps:true});

export const User = model('User',userSchema)
// User.createIndexes()
// export default User