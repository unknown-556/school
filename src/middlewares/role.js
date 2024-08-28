export const checkUserClass = (req, res, next) => {
    const { currentClass } = req.user; 
    if (!currentClass) {
        return res.status(403).json({ message: "Access denied. No class assigned to the user." });
    }
    req.userClass = currentClass; 
    next();
};

