import mongoose from "mongoose";
const { Schema,ObjectId } = mongoose;

const slotSchema = new Schema({
    adventure : {
        type : Schema.Types.ObjectId,
        ref : 'Adventure',
        required : true
    },
    slotes : {
        type: [{
            slotTime: {
                type: String,
                required: true,
            },
            date: {
                type: Date
            },
            slotDate: {
                type: Date,
                required: true,
            },
            isBooked: {
                type: Boolean,
                required: true,
                default: false
            },
            category:{
                type : String,
                required : true
            }
        }],
    },
    created_at: {
        type: Date,
        default: Date.now
    },
  
})

const Slot = mongoose.model('Slot',slotSchema)
export default Slot;