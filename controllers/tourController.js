//const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only image', 400));
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadTourImages = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  {
    name: 'images',
    maxCount: 3,
  },
]);

exports.resizeTourImages = async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );

  next();
};

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price,ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// exports.getAllTours = async (req, res, next) => {
//   try {
//     // const queryObj = { ...req.query };

//     // //filter
//     // const excludeFields = ['page', 'sort', 'limit', 'fields'];
//     // excludeFields.forEach((ele) => delete queryObj[ele]);
//     // //advance filter
//     // let queryString = JSON.stringify(queryObj);
//     // queryString = queryString.replace(
//     //   /\b(gt|gte|lt|lte)\b/g,
//     //   (match) => `$${match}`
//     // );

//     // let query = Tour.find(JSON.parse(queryString));
//     // //sort
//     // if (req.query.sort) {
//     //   const sortBy = req.query.sort.split(',').join(' ');
//     //   query = query.sort(sortBy);
//     // } else {
//     //   query = query.sort('-createdAt');
//     // }
//     // //fields limiting
//     // if (req.query.fields) {
//     //   const fields = req.query.fields.split(',').join(' ');

//     //   query = query.select(fields);
//     // } else {
//     //   query = query.select('-__v');
//     // }
//     // //pagination
//     // const page = req.query.page * 1 || 1;
//     // const limit = req.query.limit * 1 || 10;
//     // const skip = (page - 1) * limit;
//     // query = query.skip(skip).limit(limit);
//     // if (req.query.page) {
//     //   const numTOurs = await Tour.countDocuments();
//     //   if (skip > numTOurs) {
//     //     throw new Error('Page does not exist');
//     //   }
//     // }
//     // console.log(queryObj)
//     const features = new APIFeatures(Tour.find(), req.query)
//       .filter()
//       .sort()
//       .limitFields()
//       .paginate();
//     const tours = await features.query;
//     res.status(200).json({
//       status: 'success',
//       result: tours.length,
//       data: { tours },
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: 'failure',
//       message: error.message,
//     });
//   }
// };
exports.getAllTours = factory.getAll(Tour);
// exports.getTour = catchAsync(async (req, res, next) => {
//   // const tour = tours.find((ele) => ele.id === req.params.id * 1);
//   try {
//     const tour = await Tour.findById(req.params.id).populate('reviews');
//     res.status(200).json({
//       status: 'success',
//       data: { tour },
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: 'failure',
//       message: error.message,
//     });
//   }

//   // const tour = await Tour.findById(req.params.id*1);
//   // if(!tour){
//   //  return  next(new AppError('No tour found with this id',404))
//   // }
//   // res.status(200).json({
//   //   status: 'success',
//   //   data: { tour },
//   // });
// });
exports.getTour = factory.getOne(Tour, 'reviews');
// exports.createTour = catchAsync(async (req, res, next) => {
//   // const newId = tours[tours.length - 1].id + 1;
//   // const newTour = Object.assign(
//   //   {
//   //     id: newId,
//   //   },
//   //   req.body
//   // );
//   // tours.push(newTour);
//   // fs.writeFile(
//   //   `${__dirname}/dev-data/data/tours-simple.json`,
//   //   JSON.stringify(tours),
//   //   (err) => {
//   //     res.status(201).json({
//   //       status: 'success',
//   //       data: {
//   //         tour: newTour,
//   //       },
//   //     });
//   //   }
//   // );

//   // try {
//   //   const newTour = await Tour.create(req.body);

//   //   res.status(201).json({
//   //     status: 'success',
//   //     data: {
//   //       tour: newTour,
//   //     },
//   //   });
//   // } catch (error) {
//   //   res.status(400).json({
//   //     status: 'failure',
//   //     message: error.message,
//   //   });
//   // }

//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });

exports.createTour = factory.createOne(Tour);
exports.checkId = (req, res, next, val) => {
  // const tour = tours.find((ele) => ele.id === req.params.id * 1);
  // if (!tour) {
  //   return res.status(400).json({
  //     status: 'failed',
  //     message: 'Invalid ID',
  //   });
  // }
  next();
};
// exports.checkbody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'failed',
//       message: 'Missing body or price',
//     });
//   }
//   next();
// };
// exports.updateTour = catchAsync(async (req, res, next) => {
//   // try {
//   //   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//   //     new: true,
//   //     runValidators: true,
//   //   });

//   //   res.status(200).json({
//   //     staus: 'success',
//   //     data: { tour },
//   //   });
//   // } catch (error) {
//   //   res.status(400).json({
//   //     status: 'failure',
//   //     message: error.message,
//   //   });
//   // }
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     // runValidators: true,
//   });
//   if (!tour) {
//     return next(new AppError('No tour found with this id', 404));
//   }
//   res.status(200).json({
//     staus: 'success',
//     data: { tour },
//   });
// });

exports.updateTour = factory.updateOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   // try {
//   //   await Tour.findByIdAndDelete(req.params.id);
//   //   res.status(200).json({
//   //     staus: 'success',
//   //     message: 'Deleted successfully',
//   //   });
//   // } catch (error) {
//   //   res.status(400).json({
//   //     status: 'failure',
//   //     message: error.message,
//   //   });
//   // }
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppError('No tour found with this id', 404));
//   }
//   res.status(200).json({
//     staus: 'success',
//     message: 'Deleted successfully',
//   });
// });
exports.deleteTour = factory.deleteOne(Tour);
exports.getTourStats = catchAsync(async (req, res, next) => {
  // try {
  //   const stats = await Tour.aggregate([
  //     {
  //       $match: { ratingsAverage: { $gte: 4.5 } },
  //     },
  //     {
  //       $group: {
  //         _id: '$difficulty',
  //         numTours: { $sum: 1 },
  //         numRatings: { $sum: '$ratingsQuantity' },
  //         avgRating: { $avg: '$ratingsAverage' },
  //         avgPrice: { $avg: '$price' },
  //         minPrice: { $min: '$price' },
  //         maxPrice: { $max: '$price' },
  //       },
  //     },
  //     {
  //       $sort: { avgprice: -1 },
  //     },
  //     {
  //       $match: { _id: { $ne: 'easy' } },
  //     },
  //   ]);
  //   res.status(200).json({
  //     status: 'success',
  //     data: {
  //       stats,
  //     },
  //   });
  // } catch (error) {
  //   res.status(400).json({
  //     status: 'failure',
  //     message: error.message,
  //   });
  // }
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgprice: -1 },
    },
    {
      $match: { _id: { $ne: 'easy' } },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = async (req, res, next) => {
  try {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numToursStarts: { $sum: 1 },
          tours: {
            $push: '$name',
          },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: {
          numToursStarts: -1,
        },
      },
      {
        $limit: 30,
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'failure',
      message: error.message,
    });
  }
};

exports.getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(new AppError('Please provide lat and long.', 400));
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.00062137 : 0.001;
  if (!lat || !lng) {
    next(new AppError('Please provide lat and long.', 400));
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',

    data: {
      distances,
    },
  });
});
