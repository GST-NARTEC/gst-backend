import Replicate from "replicate";
import dotenv from "dotenv";

dotenv.config();

// Initialize Replicate
const replicate = new Replicate({
    auth: process.env.REPLICATE_AUTH,
});

// Function to generate images
export const runModel = async (req, res) => {
    const { prompt, num_images = 4 } = req.body;

    if (!prompt) {
        return res.status(400).json({ success: false, message: "Prompt is required" });
    }

    try {
        console.log("Running the model...");

        // Initialize an array to store image URLs
        const imageURLs = [];

        for (let i = 0; i < num_images; i++) {
            const outputArray = await replicate.run(
                "black-forest-labs/flux-schnell",
                {
                    input: { prompt },
                }
            );

            // Log the full output array for debugging
            console.log("Full output from model:", outputArray);

            if (Array.isArray(outputArray) && outputArray[0]) {
                const streamURL = outputArray[0];
                console.log(`Stream URL: ${streamURL}`);

                imageURLs.push(`${streamURL}`);
            } else {
                console.error("Model output array is empty or invalid.");
                return res.status(500).json({
                    success: false,
                    message: "Model returned an empty array or invalid output.",
                });
            }
        }

        // Log final image URLs
        console.log("Final Image URLs:", imageURLs);

        res.status(200).json({ success: true, images: imageURLs });

    } catch (error) {
        console.error("Error running the model:", error);

        // Handle specific error scenarios
        if (error.message.includes("401")) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token. Please check your REPLICATE_AUTH key.",
            });
        }

        if (error.message.includes("403")) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Please verify your permissions and token.",
            });
        }

        if (error.message.includes("429")) {
            return res.status(429).json({
                success: false,
                message: "Too many requests. Please try again later.",
            });
        }

        if (error.message.includes("500") || error.message.includes("Internal Server Error")) {
            return res.status(500).json({
                success: false,
                message: "Internal server error. Please try again later.",
            });
        }

        // Default error response
        res.status(500).json({
            success: false,
            message: "An unexpected error occurred.",
            error: error.message,
        });
    }
};
