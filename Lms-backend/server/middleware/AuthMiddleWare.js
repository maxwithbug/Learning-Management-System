import AppError from '../utilities/utils.js'
import jwt from 'jsonwebtoken'



const isLoggedIn = async (req, res, next) => {
    const {token} = req.cookies;  // for cookie-parser we can extract

    if(!token){
        return next (new AppError('Unauthitated , please login again'))
    }

    const userDetails =  await jwt.varify(token , process.env.JWT_SECTRET)  //getting details from token
    req.user = userDetails;
    next();
}


export{
    isLoggedIn,
}