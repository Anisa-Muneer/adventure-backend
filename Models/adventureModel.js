import mongoose from "mongoose";
const { Schema, ObjectId } = mongoose

const adventureSchema = new Schema({
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
    displaypicture:{
        type:String,
        default:""
    },
    joinDate:{
        type : Date
    },
    verified:{
        type : Boolean,
        default : false
    },
    requested:{
        type : Boolean,
        default : false
    },
    category: [
        {
            categoryName: {
                type: String,
                required: true,
            },
            entryFee: {
                type: Number,
                required: true,
            },
            status: {
                type: Boolean,
                default: true,
            },
            image: {
                type : String,
                default:
                    "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436178.jpg?w=740&t=st=1694511037~exp=1694511637~hmac=7afb019f7b279def27b7c8cff245f9ab0ecc12fadc50d085af0db00d777ee63b",

            }
        },
    ],
    certificates:{
        type : Array
    },
    pan:{
        type : String,
    },
    gst:{
        type : String
    },
    location:{
        type : String,
    },
    description:{
        type : String
    },
    image: {
        type: String,
        default:
          "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436178.jpg?w=740&t=st=1694511037~exp=1694511637~hmac=7afb019f7b279def27b7c8cff245f9ab0ecc12fadc50d085af0db00d777ee63b",
      },
})

const Adventure = mongoose.model('Adventure', adventureSchema)
export default Adventure;