import { Router } from "express";
import { userProtect } from "../middlewares/auth.js";
import { getProfile, updateProfile, getContacts, addContact,
     deleteContact, 
    //  getUser 
    } from "../controllers/userController.js";
import {upload} from '../utils/media.js'

const routerUser = Router();

routerUser.get('/users/profile', userProtect, getProfile);
routerUser.put('/users/profile', userProtect,upload.single('avatar'), updateProfile);
routerUser.get('/users/contacts', userProtect, getContacts);
routerUser.post('/users/contacts', userProtect, addContact);
routerUser.delete('/users/contacts', userProtect, deleteContact);
// routerUser.post('/users/user', userProtect, getUser);
// router.get('/users/status', userProtect, getUserStatus);
// router.put('/users/status', userProtect, updateStatus);

export default routerUser;