import Adventure from "../Models/adventureModel.js";
import Category from "../Models/categoryModel.js";
import uploadToClodinary from "../utils/Cloudinary.js";

export const getAdventure = async (req, res, next) => {
    try {
        const id = req.params.id
        const data = await Adventure.findById(id)
        if (data) {
            return res.status(200).json({ data: data })
        } else {
            return res.status(200).json({ message: " Data not found" })
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export const editProfile = async (req, res, next) => {
    try {
        const advId = req.params.id
        const {
            name,
            category,
            location,
            gst,
            pan,
            description
        } = req.body

        const editAdventure = await Adventure.findByIdAndUpdate({ _id: advId },
            {
                $set: {
                    name: name,
                    category: category,
                    location: location,
                    gst: gst,
                    pan: pan,
                    description: description,
                    requested: true
                }
            },
            { new: true }
        )
        
        if (editAdventure) {
            return res.status(200).json({ updated: true, data: editAdventure, message: 'Profile is updated successfully' })
        } else {
            return res.status(201).json({ message: 'Edit Profile' })
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export const advCategory = async (req, res, next) => {
    try {
        const advId = req.headers.adventureId
        const categories = await Category.find({ adventure: advId })
        return res.status(200).json({ data: categories, message: "Found the category" })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export const ProfileImage = async (req, res, next) => {
    try {
        const id = req.headers.adventureId;

        const image = req.file.path;
        const uploadDp = await uploadToClodinary(image, "dp");
        console.log(uploadDp)
        const updated = await Adventure.findByIdAndUpdate(
            { _id: id },
            { $set: { image: uploadDp.url } },
            { new: true }
        );
        console.log(updated)
        if (updated) {
            console.log("updated image");
            return res
                .status(200)
                .json({ data: updated, message: "Profile picture updated" });
        }
        return res.status(202).json({ message: "Upload failed" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const addCategory = async (req, res, next) => {
    try {
        console.log("add cat in");

        const advId = req.headers.adventureId;
        const { categoryName, entryFee } = req.body;
        const img = req.file.path;

        // Ensure the uploadToClodinary function is implemented correctly
        const uploadImg = await uploadToClodinary(img, "category");

        const exist = await Adventure.findOne({
            _id: advId,
            'category.categoryName': categoryName,
        });

        if (exist) {
            return res.status(200).json({ created: false, message: 'Category name already exists' });
        }
if (uploadImg) {
    
    const newCat = {
        categoryName: categoryName,
        entryFee: entryFee,
        image: uploadImg.url,
        status: true
    };

    // Ensure Adventure model is correctly defined
    const updated = await Adventure.findByIdAndUpdate(
        { _id: advId },
        { $push: { category: newCat } },
        { new: true }
    );

    if (updated) {
        return res.status(200).json({ created: true, message: 'Category added' });
    } else {
        return res.status(500).json({ error: 'Failed to update adventure with the new category' });
    }
}else{
    console.log("image upload failed");
}
    } catch (error) {
        console.error('Error in addCategory:', error);
        return res.status(500).json({ error: error.message });
    }
};


export const allCategory = async (req, res, next) => {
    try {
        const advId = req.headers.adventureId
        const categories = await Adventure.find({ _id: advId, }, { category: 1 })
        const [extractedCategories] = categories;

     
        return res.status(200).json({ data: extractedCategories, message: 'Category is added' })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export const manageCategory = async (req, res, next) => {
    try {
        const advId = req.headers.adventureId
        const id = req.params.id
        let category;

        category = await Adventure.findOneAndUpdate(
            { _id: advId, 'category._id': id },
            { $set: { 'category.$.status': false } },
            { new: true }
        );
        if (category) {

            res.status(200).json({
                message: category.status ? "category Deleted" : "category Listed",
            });
        } else {
            res.status(404).json({ message: "Category not found" });
        }

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


export const manageCategoryList = async (req, res, next) => {
    try {
        const advId = req.headers.adventureId
        const id = req.params.id
        let category;

        category = await Adventure.findOneAndUpdate(
            { _id: advId, 'category._id': id },
            { $set: { 'category.$.status': true } },
            { new: true }
        );
        if (category) {

            res.status(200).json({
                message: category.status ? "category Deleted" : "category Listed",
            });
        } else {
            res.status(404).json({ message: "Category not found" });
        }

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}