exports.triggerError = (req, res, next) => {
    // Triggering an intentional error
    try {
        throw new Error("Intentional error for testing purposes");
    } catch (error) {
        next(error); // Pass the error to the error handling middleware
    }
};