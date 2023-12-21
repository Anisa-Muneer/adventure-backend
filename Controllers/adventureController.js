import Posts from "../Models/PostsModel.js";
import Adventure from "../Models/adventureModel.js";
import Category from "../Models/categoryModel.js";
import Chat from "../Models/chatModel.js";
import User from "../Models/userModel.js";
import uploadToClodinary, { validateImageFormat } from "../utils/Cloudinary.js";


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
        const updated = await Adventure.findByIdAndUpdate(
            { _id: id },
            { $set: { image: uploadDp.url } },
            { new: true }
        );
        if (updated) {
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
        const advId = req.headers.adventureId;
        const { categoryName, entryFee, catDescription } = req.body;
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
                catDescription: catDescription,
                status: true
            };

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
        } else {
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

export const fetchChats = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await Chat.find({ "users.adventure": userId })
            .populate("users.user", "-password")
            .populate("users.adventure", "-password")
            .populate("latestMessage")
            .populate({
                path: "latestMessage",
                populate: {
                    path: "sender.adventure",
                    select: "-password",
                },
            })
            .populate({
                path: "latestMessage",
                populate: {
                    path: "sender.user",
                    select: "-password",
                },
            })
            .then((result) => {
                console.log(result), res.send(result);
            });
    } catch (error) {
        console.log(error.message);
    }
};
export const searchUsers = async (req, res) => {
    try {
        const keyword = req.query.search
            ? {
                $or: [
                    { name: { $regex: req.query.search, $options: "i" } },
                    { email: { $regex: req.query.search, $options: "i" } },
                ],
            }
            : {};
        console.log(keyword);

        const users = await User.find(keyword); //.find({ _id: { $ne: req.user._id } });

        res.status(200).json(users);
    } catch (error) {
        console.log(error.message);
    }
};

export const editCategory = async (req, res, next) => {
    try {
        const advId = req.headers.adventureId
        const catId = req.body._id
        const {
            categoryName,
            entryFee,
            catDescription,
            image
        } = req.body

        const editCat = await Adventure.findOneAndUpdate({ _id: advId, 'category._id': catId },
            {
                $set: {
                    "category.$.categoryName": categoryName,
                    "category.$.entryFee": entryFee,
                    "category.$.catDescription": catDescription,
                    "category.$.image": image
                }
            },
            { new: true })
        console.log(editCat, 'edit cat is heere');
        if (editCategory) {
            // Category found
            return res.status(200).json({ updated: true, data: editCat, message: "Category Found" })
        } else {
            // Category not found
            return res.status(200).json({ message: 'Data not found' })
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


export const addPosts = async (req, res, next) => {
    try {
        const image = req.file.path;
        console.log(image, 'llllllllllllllllllllllllll');
        const uploadImg = await uploadToClodinary(image, "posts");
        const { category } = req.body
        console.log(category, 'ppppppppppppppppp');
        const advId = req.headers.adventureId

        if (uploadImg) {
            const newPost = new Posts({
                category: category,
                image: uploadImg.url,
                adventure: advId,
                status: true
            })
            let posts = await newPost.save()
            console.log(posts, 'Post is saved')
            return res.status(200).json({ created: true, data: posts, message: 'Post is added' })

        }
    } catch (error) {
        return res.status(500).json({ error: error.messge });
    }
}


export const getPosts = async (req, res, next) => {
    try {
        const advId = req.headers.adventureId
        const posts = await Posts.find({ adventure: advId })
        return res.status(200).json({ data: posts, message: 'Post added successfully' })

    } catch (error) {
        return res.status(500).json({ error: error.messge });
    }
}


export const deletePost = async (req, res, next) => {
    try {
        console.log(req.body.id, 'ppppppppppppp');
        const uId = req.body.id
        console.log(uId, 'kkkkkkkkkkkkkkkkkkkkkkkkkkkk');
        const postDelete = await Posts.deleteOne({ _id: uId })
        if (postDelete) {
            return res.status(200).json({ data: postDelete, message: 'Post is deleted' })
        }
    } catch (error) {
        return res.status(500).json({ error: error.messge });
    }
}