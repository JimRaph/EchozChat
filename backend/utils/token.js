import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const tokenGenerator = (userId) => {
    return jwt.sign(
        { id: userId }, 
        process.env.JWT_SECRET, 
        { expiresIn: '30d' }
    );
}

export const passwordHasher = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export const passwordValidator = async(password, hashedPassword) =>{
    return bcrypt.compare(password, hashedPassword);
}

export const tokenVerifier = (token) => {
    try{
        return jwt.verify(token, process.env.JWT_SECRET)
    } catch(err){
        console.log('Error verifying token: ', err)
    }
}