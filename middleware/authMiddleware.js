const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        console.warn("Token not provided.");
        return res.status(401).json({ message: "Token not provided." });
    }

    const token = authHeader.split(" ")[1];
    console.log("Received token:", token);

    jwt.verify(token, "secretkey", (err, decoded) => {
        if (err) {
            console.error("Invalid token:", err);
            return res.status(403).json({ message: "Invalid token." });
        }
        req.user = decoded;
        console.log("Token verified successfully:", decoded);
        next();
    });
};


module.exports = verifyToken;
