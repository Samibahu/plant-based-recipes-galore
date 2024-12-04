import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
    plant: {
        type: String,
        required: true
    },
    dish: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    }
});

const Recipe = mongoose.model('Recipe', recipeSchema);

// Export the model as default
export default Recipe; // Ensure you are using default export
