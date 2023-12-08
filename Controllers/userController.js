import Adventure from "../Models/adventureModel.js";
import Chat from "../Models/chatModel.js";
import Review from "../Models/reviewModel.js";
import User from "../Models/userModel.js";
import uploadToClodinary from "../utils/Cloudinary.js";

export const getUser = async (req, res) => {
  try {
    const id = req.headers.userId
    const data = await User.findById(id)
    if (data) {
      return res.status(200).json({ data: data })
    } else {
      return res.status(200).json({ message: 'Data not found' })
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export const updateImage = async (req, res, next) => {
  try {
    const id = req.headers.userId;
    const image = req.file.path;
    const uploadDp = await uploadToClodinary(image, "dp");
    const updated = await User.findByIdAndUpdate(
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
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const adventureFilter = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10)
    let query = { is_blocked: false, verified: true };
    const perPage = 4;
    const skip = (page -1) * perPage;

    const result = await Adventure.aggregate([
      {
        $match: query
      },
      {
        $unwind: "$category"
      },
      {
        $match: { "category.status": true }, // Filter based on category status
      },
      {
        $count: "total"
      }
    ]);
    
    const count = result.length > 0 ? result[0].total : 0;
    const adventure = await Adventure.aggregate([
      {
        $match: query
      },
      {
        $unwind: "$category"
      },
       {
      $match: { "category.status": true }, // Filter based on category status
    },
    ]).skip(skip).limit(perPage)

  
  if(adventure){
      return res.status(200).json({ data: adventure, count, pageSize: perPage, page, message: "data found" })
    } else {
      return res.status(200).json({ message: 'data not found' })
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}


export const advProfile = async(req,res,next)=>{
  try {
    const id = req.params.id
    const adventure = await Adventure.findById(id)
    if(adventure){
      return res.status(200).json({data : adventure, message : "Data found"})
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });

  }
}


export const fetchChats = async(req,res,next)=>{
    try {
      const { userId } = req.params
     
       const result = await Chat.find({"users.user" : userId})
        .populate("users.user","-password")
        .populate("users.adventure","-password")
        .populate("latestMessage")
        .populate({
          path: "latestMessage",
        populate: {
          path: "sender.adventure" ? "sender.adventure" : "sender.user",
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
}

export const searchUsers = async(req,res)=>{
  const keyword = req.query.search
   ?{
    $or : [
      {name : { $regex : req.query.search, $options : "i"}},
      {email : { $regex : req.query.search, $options : "i"}}
    ]
   }
   : {}

   const users = await Adventure.find(keyword)
   res.status(200).json(users)
        
}


export const addReview = async(req,res,next)=>{
  try {
    const userId = req.headers.userId
    const {review, rating, id} = req.body
    const newReview = new Review({
      rating : rating,
      user : userId,
      adventure : id,
      reviewText : review
    })
    newReview.save()
    if(newReview){
      return res.status(200).json({created : true, message: "Have a nice day"})
    }else{
      return res.status(200).json({created : false, message : 'Something went wrong'})
    }
  } catch (error) {
    return res.status(500).json({ error: error.message })

  }
}


export const getReview = async (req, res, next) => {
  try {
    console.log("get Review in");
    const id = req.params.id;

    const reviews = await Review.find({ adventure: id })
    .populate("adventure","-password")
    .populate("user","-password");
    const count = reviews.length;

    let avgRating = 0
    if (count > 0) {
      const totalRating = reviews.reduce(
        (total, review) => total + review.rating, 0
      );
      const avgRatingStr = (totalRating / count).toFixed(1);
      avgRating = Number(avgRatingStr);
    } else {
      console.log("No reviews found.");
    }
    if (reviews) {
      return res.status(200).json({data:reviews,count:count,avgRating:avgRating})
      
    } else {
      return res.status(200).json({mesaage:"Reviws not found"})
      
    }
  } catch (error) {
    console.log(error.message);
  }
};
