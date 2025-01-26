import { Router } from "express";
import { bookmarks, follow, getMyProfile, getOtherUsers, Login, Logout, Register, unfollow } from "../controllers/userController.js";
import isAuthenticated from "../config/auth.js";
import upload from "../middlewares/multer.js";
import { User } from "../models/userSchema.js";
import { editProfile } from "../controllers/userController.js";

const router = Router();

router.post('/register', Register);
router.post('/login', Login);
router.get('/logout', isAuthenticated, Logout);
router.put('/bookmark/:id', isAuthenticated, bookmarks)
router.get('/profile/:id', isAuthenticated, getMyProfile)
router.get('/otherusers/:id', isAuthenticated, getOtherUsers)
router.put('/follow/:id', isAuthenticated, follow)
router.put('/unfollow/:id', isAuthenticated, unfollow)
router.put('/edit-profile/:id', isAuthenticated, editProfile)
router.post('/upload-profile-image/:id', upload.single('profileImage'), async (req, res) => {
    try {
        // const userId = req.params.id;

        // // Get the image URL or set the default image if none is uploaded
        // const imageUrl = req.file?.path || process.env.DEFAULT_PROFILE_IMAGE;

        // // Update the user with the image URL
        // const user = await User.findByIdAndUpdate(userId, { profileImage: imageUrl }, { new: true });

        // if (!user) {
        //     return res.status(404).json({ message: 'User not found' });
        // }
        console.log(req.file)
        res.status(200).json({
            message: 'Profile image updated successfully',
            // user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});
export default router;