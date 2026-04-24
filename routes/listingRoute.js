

const express = require('express');
const router = express.Router();
const asyncWrap = require('../utils/asyncWrap.js');
const ListingController = require('../controller/listing.js');
const {isLoggedIn, isOwner,validateListing} = require('../middleware.js');
const multer = require('multer');
const {storage} = require('../cloudConfig.js');

const upload = multer({storage});

//home route
router.get('/', asyncWrap(ListingController.homeRoute));

//form request 

router.get('/new' ,isLoggedIn, ListingController.newListingForm )
// create route 
router.post('/create',isLoggedIn, upload.single('listing[image]'),validateListing , asyncWrap(ListingController.createNewListing))

//edit route
router.get('/edit/:id', isLoggedIn, isOwner,  asyncWrap(ListingController.editListing))

//update route
router.put('/update/:id',isLoggedIn,isOwner, upload.single('listing[image]') ,validateListing, asyncWrap(ListingController.updateListing ))

// delete route

router.delete('/delete/:id',isOwner, isLoggedIn, asyncWrap(ListingController.destroyListing ))

// show route
router.get('/:id', asyncWrap(ListingController.showListing));

module.exports = router;
