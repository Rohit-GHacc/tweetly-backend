import jwt from "jsonwebtoken";
import { User } from "../models/userSchema.js";
import bcryptjs from 'bcryptjs';
import { Tweet } from "../models/tweetSchema.js";
export const Register = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;
        //basic validation
        if (!name || !username || !email || !password) {
            return res.status(401).json({
                message: "All fields are required.",
                success: false
            })
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(401).json({
                message: "User already exists.",
                success: false
            })
        } else {
            const salt = await bcryptjs.genSalt(16)
            const hashedPassword = await bcryptjs.hash(password, salt); //16 is salt value which decided how strong your password is

            user = await User.create({ name, username, email, password: hashedPassword })
            console.log(hashedPassword)
            console.log(user)
            return res.status(201).json({
                message: "Account created successfully.",
                success: true
            })
        }
        // user = User(req.body);
        // user.save()
        // await User.create(req.body)
        //     .then(user => res.json(user))
        //     .catch(err => {
        //         console.log(err)
        //         res.json({ error: 'Please enter a unique value for email', message: err.message })
        //     })
        // console.log(req.body);
        // res.json(req.body)
    } catch (error) {
        console.log(error);

    }
}

export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({
                message: "All fields are required.",
                success: false,

            })
        }
        const user = await User.findOne({ email }).lean();
        if (!user) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false
            })
        }
        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false
            })
        }
        const tokenData = {
            userId: user._id
        }
        const token = jwt.sign(tokenData, process.env.JWT_TOKEN_SECRET, { expiresIn: "1d" })
        return res.status(201)
        .cookie("token", token, { 
            expires: new Date(Date.now() + 21600000), 
            httpOnly: true,  
            // secure: process.env.NODE_ENV === "production"
            })
        .json({
            message: `Welcome back ${user.name}`,
            success: true,
            user,

        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "internal server error",
            success:false
        })
    }
}

export const Logout = async (req, res) => {
    return res.cookie("token", "", { expiresIn: new Date(Date.now()) }).json({
        message: "User logged out successfully",
        success: true
    })
}

export const bookmarks = async (req, res) => {
    try {
        const loggedInUserId = req.body.id;
        const tweetId = req.params.id;
        const user = await User.findById(loggedInUserId)
        const tweet = await Tweet.findById(tweetId)
        if (user.bookmarks.includes(tweetId)) {
            // remove bookmark
            await User.findByIdAndUpdate(loggedInUserId, { $pull: { bookmarks: tweetId } })
            await tweet.updateOne({ $pull: { bookmarks: loggedInUserId } })
            return res.status(200).json({
                message: "Removed from bookmarks",
                success: true
            })
        }
        else {
            // add bookmark
            await User.findByIdAndUpdate(loggedInUserId, { $push: { bookmarks: tweetId } })
            await tweet.updateOne({ $push: { bookmarks: loggedInUserId } })
            return res.status(200).json({
                message: "saved to bookmarks",
                success: true
            })
        }
    } catch (error) {
        console.log(error)
    }
}

export const getMyProfile = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id).select("-password")
        return res.status(200).json({
            user,
        })
    } catch (error) {
        console.log(error)
    }
}

export const getOtherUsers = async (req, res) => {
    try {
        const id = req.params.id;
        const otherUsers = await User.find({ _id: { $ne: id } }).select("-password")
        if (!otherUsers) {
            return res.status(401).json({
                message: "No other users",
                success: false
            })
        }
        else {
            return res.status(201).json({
                otherUsers
            })
        }
    } catch (error) {
        console.log(error)
    }
}

export const follow = async (req, res) => {
    try {
        const followerId = req.body.id;
        const userToFollowId = req.params.id;
        const follower = await User.findById(followerId)
        const userToFollow = await User.findById(userToFollowId)
        if (!userToFollow.followers.includes(followerId)) {
            await User.updateOne(follower, { $push: { following: userToFollowId } })
            await User.updateOne(userToFollow, { $push: { followers: followerId } })
        }
        else {
            return res.status(400).json({
                message: `User already followed to ${userToFollow.name}`
            })
        }
        return res.status(200).json({
            message: `${follower.name} just followed ${userToFollow.name}`
        })
    } catch (error) {
        console.log(error)
    }
}

export const unfollow = async (req, res) => {
    try {
        const loggedInUserId = req.body.id;
        const unfollowUserId = req.params.id;
        const loggedInUser = await User.findById(loggedInUserId)
        const unfollowUser = await User.findById(unfollowUserId)
        if (loggedInUser.following.includes(unfollowUserId)) {
            await loggedInUser.updateOne({ $pull: { following: unfollowUserId } })
            await unfollowUser.updateOne({ $pull: { followers: loggedInUserId } });
            return res.status(200).json({
                message: `${loggedInUser.name} unfollowed ${unfollowUser.name}`,
                success: true
            })
        }
        else {
            return res.status(400).json({
                message: `You do not follow ${unfollowUser.name}`
            })
        }
    } catch (error) {
        console.log(error)
    }
}