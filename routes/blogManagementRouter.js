const express = require("express");

const blogManagementController = require("../controllers/blogManagementController");
const {
    // requireRoles,
    authenticated,
} = require("../middlewares/auth");

const router = express.Router();

// GET - /admin/blogs/all - Shows all posts
router.get(
    "/all",
    authenticated,
    // requireRoles,
    blogManagementController.showAllPosts
);

// GET - /admin/blogs/single-post/:id - Shows a single post
router.get(
    "/single-post/:id",
    authenticated,
    // requireRoles,
    blogManagementController.singlePost
);

// POST - /admin/blogs/create-post - Creates a post
router.post(
    "/create-post",
    authenticated,
    // requireRoles,
    blogManagementController.createPost
);

// POST - /admin/blogs/edit-post/:id - Edits a post
router.put(
    "/edit-post/:id",
    authenticated,
    // requireRoles,
    blogManagementController.editPost
);

// DELETE - /admin/blogs/delete-post/:id - Deletes a post
router.delete(
    "/delete-post/:id",
    authenticated,
    // requireRoles,
    blogManagementController.deletePost
);