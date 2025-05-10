const express = require('express');
const mysql = require('mysql2/promise');
const redis = require('redis');
const { promisify } = require('util');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
app.use(bodyParser.json());
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'xeno_crm'
});
const redisClient = redis.createClient();
const xRead = promisify(redisClient.xread).bind(redisClient);

const openai = new OpenAIApi(new Configuration({
    apiKey: 'your_openai_api_key'
}));

passport.use(new GoogleStrategy({
    clientID: 'your_google_client_id',
    clientSecret: 'your_google_client_secret',
    callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => done(null, profile)));

app.use(passport.initialize());

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    res.send('Google OAuth Successful');
});

app.get('/api/secure', (req, res) => {
    res.send('This is a secure route');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Xeno CRM Backend running on http://localhost:${PORT}`);
});