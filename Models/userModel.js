import mongoose from 'mongoose';

const { Schema, objectId } = mongoose

const userSchema = new Schema({
    name:{
        type : String,
        required : true
    },
    email:{
        type : String,
        required : true
    },
    mobile:{
        type : Number,
        required : true
    },
    password:{
        type : String,
        required : true
    },
    is_blocked:{
        type : Boolean,
        default : false
    },
    verified:{
        type : Boolean,
        default : false
    },
    completed:{
        type : Boolean,
        default : false
    },
    is_admin:{
        type : Boolean,
        default : false
    }
})

const User = mongoose.model('User',userSchema)

export default User