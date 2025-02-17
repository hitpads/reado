const service = require("../services/commentService");
const User = require("../models/userModel");

// GET - /comments/all-comments - Shows all the coments
exports.getAllComments = async (req, res, next) => {
    try {
        const comments = await service.getAllComments();
        res.status(200).json({ comments });
    } catch (err) {
        next(err);
    }
};

// GET - /comments/post-comment/:id - Shows comments of a post
exports.getCommentsOfPost = async (req, res, next) => {
    try {
        const id = req.params.id;
        const comments = await service.getCommentsOfPost(id);
        res.status(200).json({ comments });
    } catch (err) {
        next(err);
    }
};

// POST - /comments/add-comment - Adds a new comment
exports.addComment = async (req, res, next) => {
    try {
        const { body, post, parentComment } = req.body;
        const user = req.userId; // ✅ Extract user ID from token

        console.log("🔍 Checking user in database with ID:", user);  // ✅ Debugging

        // ✅ Fetch user details from the database
        const theUser = await User.findById(user).select("fullname email");
        if (!theUser) {
            console.error("🚨 User not found in database:", user);  // ✅ Debugging
            return res.status(400).json({ message: "User not found" });
        }

        // ✅ Use authenticated user info
        await service.addComment(theUser.fullname, theUser.email, body, user, post, parentComment);

        res.status(200).json({ message: "Comment added!" });
    } catch (err) {
        console.error("🚨 Error adding comment:", err.message); // ✅ Debugging
        next(err);
    }
};




// PUT - /comments/edit-comment/:id - Edits a comment
exports.editComment = async (req, res, next) => {
    try {
        const id = req.params.id;
        const userId = req.userId;
        const { body, status } = req.body;
        await service.editComment(id, body, status, userId);
        res.status(200).json({ message: "done" });
    } catch (err) {
        next(err);
    }
};

// PUT - /comments/admin-edit-comment/:id - Edits a comment as an admin
exports.adminEditComment = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { body, status } = req.body;
        await service.adminEditComment(id, body, status);
        res.status(200).json({ message: "done" });
    } catch (err) {
        next(err);
    }
};

// DELETE - /comments/delete-comment/:id - Deletes a comment as an admin
exports.adminDeleteComment = async (req, res, next) => {
    try {
        const id = req.params.id;
        await service.adminDeleteComment(id);
        res.status(200).json({ message: "done" });
    } catch (err) {
        next(err);
    }
};