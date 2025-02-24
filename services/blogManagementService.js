const fs = require("fs");
const sharp = require("sharp");
const appRoot = require("app-root-path");

const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const { createError } = require("../middlewares/errors");

exports.showAllPosts = async () => {
    const posts = await Blog.find().populate([
        "user",
        "comments",
    ]);

    if (!posts) {
        throw createError(404, "", "no post found");
    }

    return posts;
};

// Single Post
exports.singlePost = async (id) => {
    const post = await Blog.findById(id).populate([
        "user",
        "comments"
    ]);

    if (!post) {
        throw createError(404, "", "no post found");
    }

    return post;
};

// Create post
exports.createPost = async (
    title,
    body,
    status,
    user
) => {
    await Blog.postValidation({
        title,
        body,
        status,
        user,
    });

    const post = await Blog.create({
        title,
        body,
        status,
        user,
    });

    const theUser = await User.findById(user);
    theUser.posts.push(post.id);
    await theUser.save();
};

// Edit post
exports.editPost = async (
    id,
    title,
    body,
    status,
    user
) => {
    const post = await Blog.findById(id);

    if (!post) {
        throw createError(404, "", "post not found");
    }

    await Blog.postValidation({
        title,
        body,
        status,
        user,
    });

    const theUser = await User.findById(user).populate("roles");
    const isUserAdmin = theUser.roles.find((s) => s.name == "admin");

    if (post.user.toString() === user.toString() || isUserAdmin) {
        post.title = title;
        post.status = status;
        post.body = body;
        post.updatedAt = Date.now();

        await post.save();
    } else {
        throw createError(401, "", "don't have the permission to edit");
    }
}

// Delete Post
exports.deletePost = async (id, userId) => {
    const post = await Blog.findById(id);

    if (!post) {
        throw createError(404, "", "post not found");
    }

    const user = await User.findById(userId).populate("roles");
    const isUserAdmin = user.roles.find((s) => s.name == "admin");

    if (post.user.toString() === user.id.toString() || isUserAdmin) {
        await Blog.findByIdAndDelete(id);
    
        const startIndexOfUserPost = user.posts.findIndex(
            (s) => s.toString() == post.id.toString()
        );
        user.posts.splice(startIndexOfUserPost, 1);
        await user.save();
    } else {
        throw createError(401, "", "don't have the permission to delete");
    }
};
