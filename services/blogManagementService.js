const fs = require("fs");
const sharp = require("sharp");
const appRoot = require("app-root-path");

const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const { createError } = require("../middlewares/errors");

// All Posts
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

// Create Post
exports.createPost = async (
    title,
    body,
    status,
    user
) => {
    const fileName = `${shortid.generate()}_${thumbnail.name}`;
    const uploadPath = `${appRoot}/src/public/uploads/thumbnails/${fileName}`;

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

// Edit Post
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
        if (thumbnail.name) {
            fs.unlink(
                `${appRoot}/src/public/uploads/thumbnails/${post.thumbnail}`,
                async (err) => {
                    if (err) return console.log(err);
                    await sharp(thumbnail.data)
                        .jpeg({ quality: 60 })
                        .toFile(uploadPath)
                        .catch((err) => {
                            console.log(err);
                        });
                }
            );
        }

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
        await Blog.findByIdAndRemove(id);
        const filePath = `${appRoot}/src/public/uploads/thumbnails/${post.thumbnail}`;
        fs.unlink(filePath, (err) => {
            if (err) {
                throw createError(400, "", "image didn't delete");
            }
        });

        const startIndexOfUserPost = user.posts.findIndex(
            (s) => s.toString() == post.id.toString()
        );
        user.posts.splice(startIndexOfUserPost, 1);
        await user.save();
    } else {
        throw createError(401, "", "don't have the permission to delete");
    }
};

// Upload Image
exports.uploadImage = async (image) => {
    if (!image) {
        throw createError(404, "", "no image found");
    }

    await Blog.singleImageValidation({ image });

    const fileName = `${shortid.generate()}_${image.name}`;
    await sharp(image.data)
        .jpeg({
            quality: 60,
        })
        .toFile(`./src/public/uploads/${fileName}`)
        .catch((err) => {
            if (err) throw createError("402", "", "image didn't upload");
        });

    const url = `${process.env.DOMAIN}/uploads/${fileName}`;

    return url;
};