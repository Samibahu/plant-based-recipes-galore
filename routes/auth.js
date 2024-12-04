// auth.js
import express from 'express';
import { check, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import User from '../models/User.js'; // Adjust the path as necessary


const router = express.Router();

// Register Handle
router.post('/register', [
    check('username', 'Username is required').not().isEmpty(),
    check('name', 'Name is required').not().isEmpty(),
    check('password', 'Password is required').not().isEmpty(),
    check('password2', 'Confirm Password is required').not().isEmpty(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], async (req, res) => {
    const { username, name, password, password2 } = req.body;
    const errors = validationResult(req);

    // Check if there are validation errors or if passwords don't match
    if (!errors.isEmpty() || password !== password2) {
        return res.status(400).json({
            success: false,
            message: password !== password2
                ? 'Passwords do not match.'
                : 'Please fill in all fields correctly.'
        });
    }

    try {
        // Check if username already exists
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ success: false, message: 'Username is already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        user = new User({
            name,
            username,
            password: hashedPassword,
            isAdmin: username === 'admin' // Set isAdmin to true if username is 'admin'
        });

        // Save user to the database
        await user.save();
        res.json({ success: true, message: 'You are now registered and can log in' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Login Handle
router.post('/login', [
    check('username', 'Username is required').not().isEmpty(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const { username, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Please fill in all fields correctly.'
        });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid user' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid password' });
        }

        req.session.user = user; // Store user in session

        // Check if user is admin and redirect accordingly
        if (user.isAdmin) {
            res.json({ success: true, user, redirect: '/admin.html' }); // Redirect to admin page
        } else {
            res.json({ success: true, user, redirect: '/' }); // Redirect to home page
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/'); // Redirect to home page on logout
    });
});

export default router;
