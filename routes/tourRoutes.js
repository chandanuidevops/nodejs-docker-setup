const express = require('express');

const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const reviewRouter = require('../routes/reviewRoutes');
const router = express.Router();
router.param('id', tourController.checkId);
//app.route('/api/v1/tours').get(getAllTours).post(createTour)
router
  .route('/')
  .get(tourController.getAllTours)
  // .post(tourController.checkbody,    tourController.createTour);
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );
  router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
    )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

router.route('/get-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(authController.restrictTo('admin'), tourController.getMonthlyPlan);
router.use('/:tourId/reviews', reviewRouter);
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getTourWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

module.exports = router;
