const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');

// Register user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            username,
            email,
            password
        });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: '30d'
            });

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000

            })

            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/me', protect, async (req, res) => {
    try {
        console.log('User from token:', req.user);
        const user = await User.findById(req.user.id).select('-password');
        res.json(user)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'Server error'});
    }

}); 

router.get('/rememberUser', async (req, res) => {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            return res.json(null);
        }
        
        // Verify token and get user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.json(null);
        }

        res.json(user);
    } catch (error) {
        console.log(error);
        res.json(null);  // Return null if any error occurs
    }
});

router.post('/logout', (req, res) => {
    res.cookie('token', '', { 
        httpOnly: true,
        expires: new Date(0)  // Expire immediately
    });
    res.json({ message: 'Logged out successfully' });
});




router.get('/search', async (req, res) => {

    try {
        

    } catch(error){

    }

});

module.exports = router;
