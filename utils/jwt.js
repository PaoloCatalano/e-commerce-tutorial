const jwt = require("jsonwebtoken");

const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
};

const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = ({ res, user }) => {
  const token = createJWT({ payload: user });

  //creare il cookie

  const oneDayInMillisec = 1000 * 60 * 60 * 24;

  res.cookie("token_name", token, {
    //important!!
    httpOnly: true,
    expires: new Date(Date.now() + oneDayInMillisec),
    // solo in production sará https, in development é http
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
};
module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
};
