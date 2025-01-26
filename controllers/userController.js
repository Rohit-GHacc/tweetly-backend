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

        // Password validation
        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long",
                success: false
            });
        }

        const hasDigit = /\d/.test(password);
        if (!hasDigit) {
            return res.status(400).json({
                message: "Password must contain at least one digit",
                success: false
            });
        }

        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        if (!hasSpecialChar) {
            return res.status(400).json({
                message: "Password must contain at least one special character",
                success: false
            });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(401).json({
                message: "User already exists.", 
                success: false
            })
        } else {
            // Reduced salt rounds from 16 to 10 for better performance while maintaining security
            const salt = await bcryptjs.genSalt(10)
            const hashedPassword = await bcryptjs.hash(password, salt);

            user = await User.create({ name, username, email, password: hashedPassword })
            
            // Generate token for auto login
            const tokenData = {
                userId: user._id
            }
            const token = jwt.sign(tokenData, process.env.JWT_TOKEN_SECRET, { expiresIn: "12h" })
            
            res.cookie("token", token, {
                maxAge: 12 * 60 * 60 * 1000, // 12 hours in milliseconds
                httpOnly: true,
                sameSite: "none",
                secure: true,
            })

            // Remove password from user object before sending
            const userWithoutPassword = user.toObject();
            delete userWithoutPassword.password;

            return res.status(201).json({
                message: "Account created successfully. You are now logged in.",
                success: true,
                user: userWithoutPassword
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
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

        // Remove .lean() as it's not needed here and can slow down the query
        const user = await User.findOne({ email });
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
        // Reduced token expiry from 1d to 12h for better security
        const token = jwt.sign(tokenData, process.env.JWT_TOKEN_SECRET, { expiresIn: "12h" })
        
        // Reduced cookie maxAge to match token expiry
        res.cookie("token", token, {
            maxAge: 12 * 60 * 60 * 1000, // 12 hours in milliseconds
            httpOnly: true,
            sameSite: "none",
            secure: true,
        })

        // Remove password from user object before sending
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        return res.status(200).json({
            message: `Welcome back ${user.name}`,
            success: true,
            user: userWithoutPassword
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}
export const editProfile = async (req, res) => {
    try {
        const { name, bio } = req.body;
        const userId = req.params.id;

        if (!name && !bio) {
            return res.status(400).json({
                message: "At least one field (name or bio) is required",
                success: false
            });
        }

        // Create update object with only provided fields
        const updateFields = {};
        if (name) updateFields.name = name;
        if (bio) updateFields.bio = bio;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateFields,
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            success: true,
            user: updatedUser
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}



export const Logout = async (req, res) => {
    return res.cookie("token", "", { expires: new Date(Date.now()) }).json({
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
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
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
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
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
            return res.status(200).json({
                otherUsers
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
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
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
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
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}