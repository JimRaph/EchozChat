import { User } from "../models/userModel.js";
import { 
  cloudinary } from "../utils/media.js";

//ADD A CONTACT TO THE USER'S CONTACT LIST

export const addContact = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    
    const { Phone, first_name, last_name } = req.body;
    if (!Phone) {
      return res.status(400).json({ 
        message: "Phone, first and last names number are required" 
      });
    }
    
    // Find the contact user by phone number, exclude some sensitive fields
    const contact = await User.findOne({ Phone })
      .select('-contacts -verificationCode -createdAt -updatedAt');
    
    if (!contact) {
      console.log('Contact not found in addContact');
      return res.status(404).json({ message: "Contact not found, invite user to WhatsApp" });
    }

    // Find the authenticated user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if contact already exists by comparing ObjectId strings
    const contactExists = user.contacts.some(
      (c) => c.contact && c.contact.toString() === contact._id.toString()
    );

    if (contactExists) {
      console.log('Contact already exists in user contacts');
      return res.status(400).json({
        message: "Contact already exists",
        contact: contact,
      });
    }

    // Push new contact with only the ObjectId reference
    user.contacts.push({ 
      contact: contact._id,
      firstname: first_name || null,
      lastname: last_name || null
    });

    // Save user with new contact
    await user.save();

    // Populate the newly added contact's 'contact' field to get full user details
    await user.populate({
      path: `contacts.${user.contacts.length - 1}.contact`,
      select: '-contacts -verificationCode -createdAt -updatedAt'
    });

    const newlyAddedContact = user.contacts[user.contacts.length - 1];

    console.log('CONTACT ADDED: ', newlyAddedContact);

    // Return response with populated contact object
    return res.json({
      message: "Contact added successfully",
      contact: newlyAddedContact,
      success: true
    });

  } catch (error) {
    console.error("Error adding contact: ", error);
    return res.status(500).json({
      message: "Error adding contact",
      error: error.message,
    });
  }
};

//DELETE A CONTACT FROM THE USER'S CONTACT LIST
export const deleteContact = async (req, res) => {
  try {
    const { Phone } = req.body; 

    // Find the contact to be deleted
    const contact = await User.findOne({ Phone });
    if (!contact) {
      return res
        .status(404)
        .json({ message: "Contact not found, invite user to WhatsApp" });
    }

    // Find the authenticated user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if contact exists in user's contact list
    if (
      !user.contacts.some(
        (c) => c.contact.toString() === contact._id.toString()
      )
    ) {
      return res
        .status(400)
        .json({ message: "Contact does not exist in your contact list" });
    }

    // Remove the contact from the list
    user.contacts = user.contacts.filter(
      (c) => c.contact.toString() !== contact._id.toString()
    );

    // Save changes to the database
    await user.save();
    
    console.log('CONTACT DELETED ')
    return res.json({
      message: "Contact deleted successfully",
      contact: user.contacts,
      success: true
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return res
      .status(500)
      .json({ message: "Error deleting contact", error: error.message });
  }
};

export const getContacts = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    // Find user and populate contacts.contact with selected fields excluded
    const user = await User.findById(req.user.id)
      .populate('contacts.contact', '-contacts -verificationCode -createdAt -updatedAt');

    if (!user) {
      console.log('User does not exist');
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Contacts fetched successfully",
      contact: user.contacts,  // plural for clarity
      success: true
    });
  } catch (error) {
    console.error("Error getting contacts: ", error);
    return res.status(500).json({
      message: "Error getting contacts",
      error: error.message,
    });
  }
};

//RETRIEVE USER PROFILE
export const getProfile = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized, user id required" });
    }

    const user = await User.findById(userId)
              .select('-verificationCode -password')
              .populate('contacts.contact', '-contacts -verificationCode -createdAt -updatedAt');

  console.log('SENT: ', user)
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Profile retrieved successfully",
      user: user,
      success: true
    });
  } catch (error) {
    // console.log("Error getting user profile: ", error);
    res
      .status(500)
      .json({ message: "Error getting user profile", error: error.message });
  }
};

//UPDATE USER PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { name, status } = req.body;

    const updateFields = {};
    if (name !== undefined && name !== null) updateFields.username = name;
    if (status !== undefined && status !== null) updateFields.status = status;
    console.log(req.file)
    // Update only if there are fields to update
    if (Object.keys(updateFields).length === 0 && !req.file) {
      console.log('No valid fields provided for update userController updateProfile')
      return res
        .status(400)
        .json({ success: false, message: "No valid fields provided for update" });
    }


    if (req.file && req.file.path) {
      updateFields.avatar = req.file.path; 
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateFields, {
      new: true,
    });

    return res.json({
      message: "Profile updated successfully",
      user: user,
      success: true
    });
  } catch (error) {
    // console.log("Error updating profile: ", error);
    return res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
}
