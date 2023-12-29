import Stripe from "stripe";
import Posts from "../Models/PostsModel.js";
import Adventure from "../Models/adventureModel.js";
import Chat from "../Models/chatModel.js";
import Review from "../Models/reviewModel.js";
import User from "../Models/userModel.js";
import { uploadToClodinary } from "../utils/Cloudinary.js";

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
    const skip = (page - 1) * perPage;

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


    if (adventure) {
      return res.status(200).json({ data: adventure, count, pageSize: perPage, page, message: "data found" })
    } else {
      return res.status(200).json({ message: 'data not found' })
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}


export const advProfile = async (req, res, next) => {
  try {
    const id = req.params.id
    const adventure = await Adventure.findById(id)
    if (adventure) {
      return res.status(200).json({ data: adventure, message: "Data found" })
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });

  }
}


export const fetchChats = async (req, res, next) => {
  try {
    const { userId } = req.params

    const result = await Chat.find({ "users.user": userId })
      .populate("users.user", "-password")
      .populate("users.adventure", "-password")
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

export const searchUsers = async (req, res) => {
  const keyword = req.query.search
    ? {
      $or: [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } }
      ]
    }
    : {}

  const users = await Adventure.find(keyword)
  res.status(200).json(users)

}


export const addReview = async (req, res, next) => {
  try {
    const userId = req.headers.userId
    const { review, rating, id } = req.body
    const newReview = new Review({
      rating: rating,
      user: userId,
      adventure: id,
      reviewText: review
    })
    newReview.save()
    if (newReview) {
      return res.status(200).json({ created: true, message: "Have a nice day" })
    } else {
      return res.status(200).json({ created: false, message: 'Something went wrong' })
    }
  } catch (error) {
    return res.status(500).json({ error: error.message })

  }
}


export const getReview = async (req, res, next) => {
  try {
    const id = req.params.id;

    const reviews = await Review.find({ adventure: id })
      .populate("adventure", "-password")
      .populate("user", "-password");
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
      return res.status(200).json({ data: reviews, count: count, avgRating: avgRating })

    } else {
      return res.status(200).json({ mesaage: "Reviws not found" })

    }
  } catch (error) {
    console.log(error.message);
  }
};


export const adventurePost = async (req, res, next) => {
  try {
    const id = req.params.id
    const posts = await Posts.find({ adventure: id })
    console.log(posts, "posts in");
    if (posts) {
      return res.status(200).json({ data: posts, message: 'Post found' })
    }
  } catch (error) {
    return res.status(500).json({ error: error.message })

  }
}


export const walletAmount = async (req, res, next) => {
  try {
    console.log("payment");
    const stripe = new Stripe("sk_test_51OF855SGN2zHCLENS0gaFeQhHc7oLPwx2DSd8IC4dKhtQJIYo4OxdlJ8oONQEVI118Ero5V9RQbGEjkITJqtHQxN00HN1rnb3k");

    const amount = req.params.amount;
    console.log(amount);

    const paymentintent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "inr",
      automatic_payment_methods: {
        enabled: true,
      },
    });
    console.log(paymentintent.client_secret);
    res.status(200).json({
      clientSecret: paymentintent.client_secret,
    });
  } catch (error) {
    console.log(error);
    next(error)
  }
};

export const walletpaymentSuccess = async (req, res, next) => {
  try {
    console.log('reached');
    const { userId, amount } = req.body
    console.log("payment success", userId, amount);
    let user = await User.findByIdAndUpdate({ _id: userId }, { $inc: { wallet: amount } }, { new: true })
    console.log(user, 'lllllllllllllllllllllllllllllll');
    return res.status(200).json({ status: true, data: user, message: "Payment successful!" })
  } catch (error) {
    console.log(error);
  }
}
