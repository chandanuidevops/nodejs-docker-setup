const express = require('express');
const viewsController = require('../controllers/viewsController');
const booKingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');
const router = express.Router();

router.get(
  '/',
  booKingController.createBookingCheckOut,
  authController.isLoggedIn,
  viewsController.getOverview
);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours',authController.protect,viewsController.getMyTour)
router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
