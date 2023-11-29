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
    },
    image: {
        type: String,
        default:
          "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436178.jpg?w=740&t=st=1694511037~exp=1694511637~hmac=7afb019f7b279def27b7c8cff245f9ab0ecc12fadc50d085af0db00d777ee63b",
      },
})

const User = mongoose.model('User',userSchema)

export default User