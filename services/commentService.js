const Comment = require("../models/commentModel");
const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const { createError } = require("../middlewares/errors");


//Get All
exports.getAllComments = async () => {
    const comments = await Comment.find();
    return comments;
};

//Get One Post't Comments
exports.getCommentsOfPost = async (id) => {
    const comments = await Comment.find({ post: id });
    return comments;
};

// Add Comment
exports.addComment = async (fullname, email, body, user, post, parentComment) => {
    // ✅ No longer expects `fullname` and `email` from the frontend
    await Comment.commentValidation({ fullname, email, body });

    const thePost = await Blog.findById(post);
    if (!thePost) {
        throw createError(401, "", "Post is not found");
    }

    const comment = await Comment.create({
        fullname,
        email,
        body,
        parentComment,
        user,
        post,
        status: "confirmed",
    });

    // ✅ Link comment to user
    await User.findByIdAndUpdate(user, { $push: { comments: comment._id } });

    // ✅ Link comment to post
    thePost.comments.push(comment._id);
    await thePost.save();
};



// Admin Delete Comment
exports.adminDeleteComment = async (id) => {
    const comment = await Comment.findByIdAndDelete(id);
    const user = await User.findById(comment.user);
    const post = await Blog.findById(comment.post);

    if (user) {
        const startIndexOfUserComment = user.comments.findIndex(
            (s) => s.toString() == comment._id.toString()
        );
        user.comments.splice(startIndexOfUserComment, 1);
        await user.save();
    }

    const startIndexOfPostComment = post.comments.findIndex(
        (s) => s.toString() == comment._id.toString()
    );
    post.comments.splice(startIndexOfPostComment, 1);

    await post.save();
};