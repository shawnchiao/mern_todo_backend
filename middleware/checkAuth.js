import jwt from 'jsonwebtoken';

import HttpError  from "../models/httpError.js";

 const checkAuth= (req, res, next) => {
  // if (req.method === 'OPTIONS') {
  //   return next();
  // }
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      throw new HttpError();
    }
   const decodedToken = jwt.verify(token, process.env.JWT_KEY);
   req.userData = { userId: decodedToken.userId};
   next();
  } catch (err) {
    const error = new HttpError('Authentication falled', 403);
    return next(error);
    
  };

};

export default checkAuth;