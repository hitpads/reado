const path = require("path");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const winston = require("./config/winston");
const { errorHandler } = require("./middlewares/errors");
const { setHeaders } = require("./middlewares/headers");
const { limiter } = require("./config/rateLimit");

const express = require("express");
const dotEnv = require("dotenv");
const morgan = require("morgan");

dotEnv.config({ path: "./config/config.env" });

// ENVs
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV;

// DB
connectDB();

// 
const app = express();

// rate limiter
app.use(limiter);
app.use(cookieParser())

// logging
if (process.env.NODE_ENV === "development")
    app.use(morgan("combined", { stream: winston.stream }));

app.use(express.static(path.join(__dirname, "src")));

// BodyParser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(setHeaders);

// serve static files
app.use(express.static(path.join(__dirname, "public")));

// routes
app.use("/", require("./routes/userRouter"));
app.use("/admin/roles", require("./routes/roleManagementRouter"));
app.use("/admin/users", require("./routes/userManagementRouter"));
app.use("/comments", require("./routes/commentRouter"));
app.use("/p", require("./routes/blogRouter"));
app.use("/admin/blogs", require("./routes/blogManagementRouter"));
app.use("/admin/url-roles", require("./routes/urlRolesRouter"));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "src", "home.html"));
});

// error handler
app.use(errorHandler);

// running server
app.listen(PORT, () => {
    console.log("***********************");
    console.log(`Server started on ${PORT} && running on ${NODE_ENV} mode`);
});