import { Router } from "express";
import {createTweet, deleteTweet, getTweets, getFollowingTweets, likeOrDislikeTweet} from '../controllers/tweetController.js'
import isAuthenticated from '../config/auth.js'
const router = Router();
router.post('/create',isAuthenticated,createTweet)
router.delete('/delete/:id',isAuthenticated,deleteTweet)
router.put('/like/:id',isAuthenticated,likeOrDislikeTweet)
router.get('/tweets/:id',isAuthenticated,getTweets)
router.get('/followingtweets/:id',isAuthenticated,getFollowingTweets)
export default router;