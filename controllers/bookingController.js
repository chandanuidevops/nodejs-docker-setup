const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');

const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //get booked tour
  const tour = await Tour.findById(req.params.tourId);
  //create checkout seetion
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      //   {
      //     name: `${tour.name} Tour`,
      //     description: tour.summary,
      //     images: ['https://www.natours.dev/img/tours/tour-2-cover.jpg'],
      //     amount: tour.price * 100,
      //     currency: 'usd',
      //     quantity: 1,
      //   },
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: ['https://www.natours.dev/img/tours/tour-2-cover.jpg'],
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
  });
  //create session as a  response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckOut = catchAsync(async (req, res, next) => {
  //this is only temporary ,because any one can do booking without payment 
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });
  res.redirect(req.originalUrl.split('?')[0])
});
