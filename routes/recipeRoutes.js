import express from 'express'; // Use ES module import
import Recipe from '../models/recipe.js'; // Adjust the path as necessary

const router = express.Router();

// POST route to handle recipe form submissions
router.post('/add', async (req, res) => {
    const { plantDropdown, dishDropdown, userName } = req.body;

    try {
        // Check if all fields are present
        if (!plantDropdown || !dishDropdown || !userName) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const newRecipe = new Recipe({
            plant: plantDropdown,
            dish: dishDropdown,
            userName: userName
        });

        await newRecipe.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving recipe:', error);
        res.status(500).json({ success: false, error: 'Failed to save recipe' });
    }
});

export default router; // Use ES module export
