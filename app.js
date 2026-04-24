if(process.env.NODE_ENV != 'production'){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const listingRoutes = require('./routes/listingRoute.js');
const reviewRoutes = require('./routes/reviewRoute.js');
const userRoutes = require('./routes/user.js');
const session = require('express-session');
const mongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

const dbUrl = process.env.MONGO_URI;
const secret = process.env.SECRET;
const port = process.env.PORT || 8080;

if (!dbUrl)  throw new Error("❌ MONGO_URI is not defined in your .env file");
if (!secret) throw new Error("❌ SECRET is not defined in your .env file");

async function main() {
    await mongoose.connect(dbUrl);
}

main()
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch((err) => console.log('❌ MongoDB connection error:', err));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "view"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);

const store = mongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: secret,
    },
    touchAfter: 24 * 3600,
});

store.on('error', (err) => {
    console.log('❌ Error in mongo session store:', err);
});

const sessionOptions = {
    store,
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.successMsg = req.flash('success');
    res.locals.errorMsg   = req.flash('error');
    res.locals.currUser   = req.user;
    next();
});
app.get("/", (req, res) => {
  res.redirect("/listings");
});
app.use('/listing', listingRoutes);
app.use('/listing/:id/review', reviewRoutes);
app.use('/', userRoutes);

app.all('*', (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
    let { status, message } = err;
    if (!status) status = 500;
    res.status(status).render('./error/error.ejs', { message });
});

app.listen(port, () => {
    console.log(`✅ Server listening on port ${port}`);
});