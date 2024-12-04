import dotenv from 'dotenv'; // Import dotenv
dotenv.config(); // Ensure this is the first line in app.js

import express from 'express'; // Use ES module import
import mongoose from 'mongoose'; // Use ES module import
import session from 'express-session'; // Use ES module import
import flash from 'connect-flash'; // Use ES module import
import path from 'path'; // Use ES module import
import authRoutes from './routes/auth.js'; // Adjust path as needed
import recipeRoutes from './routes/recipeRoutes.js'; // Adjust path as needed

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // To parse JSON data
app.use(express.static(path.join(process.cwd(), 'public'))); // Serve static files

app.use(session({
    secret: process.env.SESSION_SECRET, // Use a secure session secret from your .env file
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

// Global Variables Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.session.user || null;
    next();
});

// Routes
app.use('/auth', authRoutes); // Authentication routes
app.use('/recipes', recipeRoutes); // Recipe routes

// Serve the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'home.html'));
});

// Protect pages
const protectedRoutes = ['/breakfast.html', '/maincourse.html', '/desserts.html', '/snacks.html'];

protectedRoutes.forEach(route => {
    app.get(route, (req, res) => {
        if (!req.session.user) {
            req.flash('error_msg', 'Please log in to view this resource');
            return res.redirect('/'); // Redirect to home.html
        }
        res.sendFile(path.join(process.cwd(), 'public', route));
    });
});

// Check session status
app.get('/auth/check-session', (req, res) => {
    res.json({ loggedIn: !!req.session.user });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
