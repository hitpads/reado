const yup = require("yup");

// Yup Schema for Regisrer Requirements
exports.addCommentScheme = yup.object().shape({
    fullname: yup
        .string()
        .notRequired(),
    email: yup
        .string()
        .email("Email is not valid")
        .notRequired(),
    body: yup.string().required("Plesae enter body of the comment"),
    status: yup
        .mixed()
        .oneOf(
            ["waiting", "rejected", "confirmed"],
            "Choose one of these: waiting, rejected, confirmed"
        )
        .default("confirmed"),
});