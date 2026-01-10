import { tokenVerifier } from "../utils/token.js";
import {User} from '../models/userModel.js'

export const userProtect = async(req, res, next) =>{
    try {
        const token = req.headers.authorization?.split(' ')[1]
        if(!token){
            return res.status(401).json({message: 'No token, authorization denied'});
        }

        const decoded = tokenVerifier(token)
        if(!decoded){
            return res.status(401).json({message: 'Token is invalid, authorization denied'});
        }
        console.log(decoded)
        const user = await User.findById(decoded.id)
        if(!user){
            return res.status(401).json({message: 'User not found, authorization denied'});
        }

        req.user = user;
        next();
    } catch (error) {
        console.log('Error with user protection middleware: ', error);
    }
};