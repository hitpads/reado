const { createError } = require("../middlewares/errors");
const Blog = require("../models/blogModel");

const redis = require("redis");

const client = redis.createClient();
// All Posts
exports.showAllPosts = async () => {
    const posts = await Blog.find({ status: "public" }).populate([
        "user",
        "comments",
    ]);

    if (!posts) {
        throw createError(404, "", "no post found");
    }

    return posts;
};

// Singe Post
exports.singlePost = async (id) => {
    const post = await Blog.findById(id).populate([
        "user",
        "comments",
    ]);

    if (!post || post.status !== "public") {
        throw createError(404, "", "no post found");
    }

    post.views++;
    post.save();

    return post;
};

// Like Post
exports.likePost = async (id) => {
    const post = await Blog.findById(id);

    if (!post || post.status !== "public") {
        throw createError(404, "", "no post found");
    }

    post.likes++;
    post.save();
};
