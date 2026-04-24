const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

const dbUrl = "mongodb://127.0.0.1:27017/airbnb";

mongoose.connect(dbUrl)
.then(() => {
    console.log("MongoDB connected");
})
.catch((err) => {
    console.log(err);
});

console.log("connection in another file");

const initDB = async () => {
    await Listing.deleteMany({});
    initdata.data = initdata.data.map((obj)=> ({...obj, owner:"674648e077d96849f121c0e3"}));
    await Listing.insertMany(initdata.data);
    console.log("data was saved");
};

initDB();