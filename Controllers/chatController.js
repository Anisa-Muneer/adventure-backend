import Chat from "../Models/chatModel.js";
import Message from "../Models/messageModel.js";
import User from "../Models/userModel.js";

export const accessChat = async (req, res, next) => {

    const { userId, adventureId } = req.body
    if (!userId) {
        console.log("UserId param not send with request");
        return res.status(400)
    }

    try {

        let isChat = await Chat.findOne({
            "users.adventure": adventureId,
            "users.user": userId,
        })
            .populate("users.user", "-password")
            .populate("users.adventure", "-password")
            .populate("latestMessage")

        if (isChat) {
            res.status(200).json(isChat)
        } else {
            const chatData = {
                chatName: "sender",
                users: {
                    adventure: adventureId,
                    user: userId
                }
            }

            const createdChat = await Chat.create(chatData)

            const FullChat = await Chat.findOne({ _id: createdChat._id })
                .populate("users.user", "-password")
                .populate("users.adventure", "-password")
                .populate("latestMessage")
                .populate({
                    path: "latestMessage",
                    populate: {
                        path: "sender.adventure" ? "sender.adventure" : "sender.user",
                        select: "-password",
                    },
                });
            res.status(200).json(FullChat)
        }

    } catch (error) {
        return res.status(400).json({ error: error.message });

    }
}

export const sendMessage = async (req, res) => {
    try {

        const { content, chatId, userId } = req.body
        if (!content || !chatId) {
            console.log("Invalid parameters");
            return res.status(400)
        }
        const newMessage = {
            sender: { user: userId },
            content: content,
            chat: chatId
        }
        let message = await Message.create(newMessage)

        message = await message.populate('sender.user', 'name')
        message = await message.populate('chat')

        message = await User.populate(message, [
            {
                path: 'chat.users.user',
                select: 'name email'
            }
        ])
        let data = await Chat.findByIdAndUpdate(chatId, {
            latestMessage: message,
        }, { new: true })
        res.json(message)
    } catch (error) {
        console.log(error.message);

    }
}

export const allMessages = async (req, res) => {
    try {

        const message = await Message.find({ chat: req.params.chatId })
            .populate('sender.user', 'name email')
            .populate('sender.adventure', 'name')
        res.json(message)
    } catch (error) {
        console.log(error.message);

    }
}

export const adventureMessage = async (req, res) => {
    try {
        const { content, chatId, userId } = req.body
        if (!content || !chatId) {
            console.log('Invalid parameters');
            return res.status(400)

        }
        console.log(userId);
        const newMessage = {
            sender: { adventure: userId },
            content: content,
            chat: chatId,
        };

        let message = await Message.create(newMessage);

        message = await message.populate('sender.adventure', 'name')
        message = await message.populate('chat')

        message = await User.populate(message, [
            {
                path: 'chat.users.adventure',
                select: 'name email',
            }
        ])

        let data = await Chat.findByIdAndUpdate(chatId, {
            latestMessage: message,
        }, { new: true });

        res.json(message);
    } catch (error) {
        return res.status(500).json({ error: error.message });

    }
}