require("dotenv").config();
require("express-async-errors"); //per avere un TRY-CATCH automatico in ogni controller
//express framework
const express = require("express");
//database
const connectDB = require("./db/connect");
// routers
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const orderRouter = require("./routes/orderRoutes");
//middleware
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
//cookies
const cookieParser = require("cookie-parser");
// CORS (per far funzionare il backend da altri siti)
const cors = require("cors");
//other packages
const morgan = require("morgan");
//imges
const fileUpload = require("express-fileupload");
//security packages
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");

const port = process.env.PORT;
const app = express();

// app
app.use(express.json());
//cookies
app.use(cookieParser(/* signing: */ process.env.JWT_SECRET));
//security packages
app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
//Helmet
app.use(helmet());
//CORS
// allow only from the origin
// const corsOptions = {
//   origin: "https://test-frontend-react.netlify.app",
//   optionsSuccessStatus: 200,
// };
// app.use(cors(corsOptions));

app.use(cors());

//xss
app.use(xss());
//mongo sanitize
app.use(mongoSanitize());

//altri

//static files
app.use(express.static("./public"));
//upload images
app.use(fileUpload());

// all routes
app.get("/api/v1", (req, res) => {
  res.status(200).send(
    `<center><h1 style="background-color:powderblue;">Welcome to the E-Commerce API tutorial</h1>
      <p><a href="https://e-commerce-tutorial.onrender.com/">Docs</a></p></center>`
  );
});
// specific routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

// app (errors)
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware); // per express rules, deve essere usato per ultimo middleware!

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, console.log(`Server on port ${port}`));
    // app.listen(5000 , console.log(`Server on port 5000`));
  } catch (error) {
    console.log(error);
  }
};

start();
