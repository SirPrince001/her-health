const User = require("../models/user");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ValidationError, NotFoundError } = require("../helper/error");

const getCoordinatesFromCity = require("../utils/location"); // Path to geocoding service

exports.createUser = async (request, response, next) => {
  try {
    let { fullName, email, password, age, gender, city, phone } = request.body;

    // Validate input
    if (
      !fullName ||
      !email ||
      !password ||
      !age ||
      !gender ||
      !city ||
      !phone
    ) {
      throw new ValidationError("All fields are required");
    }

    // Check if email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ValidationError(
        `User with this email ${userExists.email} already exists`
      );
    }

    // Check if phone number already exists
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      throw new ValidationError(
        `User with this phone number ${phoneExists.phone} already exists`
      );
    }

    // Get coordinates from city
    const { longitude, latitude } = await getCoordinatesFromCity(city);

    // Hash password
    password = bcryptjs.hashSync(password, 10);

    // Create user with location
    const user = new User({
      fullName,
      email,
      password,
      age,
      gender,
      city,
      phone,
      location: {
        type: "Point",
        coordinates: [{ longitude: longitude, latitude: latitude }],
      },
    });

    let savedUser = await user.save();

    // Result and exclude password
    savedUser = savedUser.toJSON();
    delete savedUser.password;

    response.status(201).json({
      success: true,
      response_message: `User ${user.fullName} created successfully`,
      data: savedUser,
    });
  } catch (error) {
    console.log(error)
    next(error);
  }
};

exports.loginUser = async (request, response, next) => {
  try {
    let { email, password } = request.body;
    //validate input
    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }
    //check if email exists
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError(`User with email ${user.email} not found`);
    }
    //compare password
    const isMatch = bcryptjs.compareSync(password, user.password);
    if (!isMatch) {
      throw new ValidationError("Invalid email or password");
    }
    // create payload
    const payload = { userId: user._id };
    //generate and send jwt token
    const token = jwt.sign({ payload }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    response.json({
      success: true,
      response_message: `User ${user.fullName} logged in successfully`,
      data: { token },
    });
  } catch (error) {
    next(error);
  }
};
