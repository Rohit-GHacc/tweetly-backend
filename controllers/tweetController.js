import { Tweet } from '../models/tweetSchema.js';
import { User } from '../models/userSchema.js';


export const createTweet = async (req, res) => {
    try {
        const { description, id } = req.body;
        const user = await User.findById(id).select("-password")
        if (!description || !id) {
            return res.status(401).json({
                message: "Fields are required.",
                success: false
            })
        }
        await Tweet.create({
            description,
            userId: id,
            user
        })

        return res.status(201).json({
            message: "Tweet created successfully",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const deleteTweet = async (req, res) => {
    try {
        const { id } = req.params;
        await Tweet.findByIdAndDelete(id);
        return res.status(200).json({
            message: "tweet deleted successfully",
            success: true
        })
    } catch (error) {

    }
}

export const likeOrDislikeTweet = async (req, res) => {
    try {
        const loggedInUserId = req.body.id;
        const tweetId = req.params.id;
        // pehle find krenge konsa tweet like/dislike kia h
        const tweet = await Tweet.findById(tweetId);

        //fir check krenge agr wo user already like list me h toh mtlb dislike kia h
        //pehle se nhi h toh like kia h
        if (tweet.like.includes(loggedInUserId)) {
            // dislike
            await Tweet.findByIdAndUpdate(tweetId, { $pull: { like: loggedInUserId } })
            return res.status(200).json({
                message: "User disliked"
            })
        }
        else {
            //like
            await Tweet.findByIdAndUpdate(tweetId, { $push: { like: loggedInUserId } })
            return res.status(200).json({
                message: "User liked"
            })
        }
    } catch (error) {
        console.log(error)
    }
}
// now I'll handle both following or all tweets in a single function
export const getTweets = async (req, res) => {
    // loggedinuser ka tweet + following user ka tweet
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        const filter = req.query.filter;

        const followingTweets = await Promise.all(user.following.map((otherUsersId) => {
            return Tweet.find({ userId: otherUsersId })
        }))

        if (filter === 'following')
            return res.status(200).json({
                tweets: [].concat(...followingTweets)
            })
        else {

            const loggedInUserTweets = await Tweet.find({ userId });
            return res.status(200).json({
                tweets: loggedInUserTweets.concat(...followingTweets)
            })
        }

    } catch (error) {
        console.log(error)
    }
}

export const getFollowingTweets = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const followingTweets = await Promise.all(user.following.map((followingUserId) => {
            return Tweet.find({ userId: followingUserId })
        }))

    } catch (error) {
        console.log(error)
    }
}