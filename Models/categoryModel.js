import mongoose from 'mongoose'
const { Schema } = mongoose

const categorySchema = new Schema({
    adventure: {
        type: Schema.Types.ObjectId,
        ref: "Adventure",
        required: true
    },
    categoryName: {
        type: String,
        required: true
    },
    
    status: {
        type: Boolean,
        default: false
    },
    image: {
        type: String,
    },
    entryFee: {
        type: Number,
        required: true
    }
})

const Category = mongoose.model('Category', categorySchema)

export default Category