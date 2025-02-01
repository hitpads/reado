const yup = require("yup");

exports.addPostSchema = yup.object().shape({
    title: yup
        .string()
        .required("Title is required")
        .min(5, "Title can't be less than 5")
        .max(100, "Title can't more than 100"),
    body: yup.string().required("Body is required"),
    status: yup
        .mixed()
        .oneOf(
            ["public", "draft", "archived"],
            "Choose one of these: public, draft, archived"
        ),
});
