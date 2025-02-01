const express = require("express");

const {
    authenticated,
    // requireRoles,
} = require("../middlewares/auth");
const userManagementController = require("../controllers/userManagementController");

const router = express.Router();

// GET - /admin/users - Shows All the Users
router.get(
    "/",
    authenticated,
    // requireRoles,
    userManagementController.showAllUsers
);

// PUT - /admin/users/add-role/:id - Adds a Role
router.put(
    "/add-role/:id",
    authenticated,
    userManagementController.addRole
);

// PUT - /admin/users/remove-role/:id - Removes a Role
router.put(
    "/remove-role/:id",
    authenticated,
    userManagementController.removeRole
);

// GET - /admin/users/detail-user/:id - Shows Details of a User
router.get(
    "/detail-user/:id",
    authenticated,
    userManagementController.detailUser
);

module.exports = router;