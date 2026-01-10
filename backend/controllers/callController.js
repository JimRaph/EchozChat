import { json } from 'express';
import { Call } from '../models/callModel.js';
import { Chat } from '../models/chatModel.js';
import { User } from '../models/userModel.js';



const populateCallWithPhoneNumbers = async (call) => {
  return await Call.populate(call, [
    { 
      path: 'caller',
      select: 'Phone countryCode avatar isOnline'
    },
    {
      path: 'participants',
      select: 'Phone countryCode avatar isOnline'
    }
  ]);
}


const initiateCall = async (req, res) => {
  try {
    // console.log('INITIATING CALL');
    const { type, participants, chatId } = req.body;
    const callerId = req.user._id;

    if (!type || !['audio', 'video'].includes(type)) {
      return res.status(400).json({
        message: 'Invalid call type. Must be either audio or video'
      });
    }

    let chat = null;
    let avatar = null;

    if (chatId) {
      chat = await Chat.findById(chatId).lean();
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }

      if(chat.type !== 'group'){
        participants.push(req.user._id.toString())
      }


      if (chat.type === 'group') {
        avatar = chat.avatar || null;
      } else {
        const otherId = chat.participants.find(
          (id) => id.toString() !== callerId.toString()
        );
        const otherUser = await User.findById(otherId).select('avatar').lean();
        avatar = otherUser?.avatar || null;
      }
    } 
   
    const participantsList = participants || [];
        const participantsWithPhone = await User.find({
          _id: { $in: participantsList }
      }).select('Phone countryCode avatar');


    const call = new Call({
      type,
      participants: participantsWithPhone.map((p) => p._id),
      caller: callerId,
      isGroupCall: chat ? chat.type === 'group' : false,
      chatId: chat?._id || null,
      avatar,
      status: 'initiating'
    });

    await call.save();
    const populatedCall = await populateCallWithPhoneNumbers(call);
    console.log('PARTI: ', participants)
    console.log('CALL INIII: ', call)
    res.status(201).json({
      ...populatedCall.toObject(),
      callerPhone: req.user.Phone,
      success: true
    });
  } catch (error) {
    console.error('Call initiation error:', error);
    res.status(500).json({
      message: 'Failed to initiate call',
      details: error.message
    });
  }
};

const getCallHistory = async (req, res) => {
  try {
    // console.log('GETTING CALL HISTORY');
    const userId = req.user._id;

    if (!userId) {
      console.log('User not authorized')
      return res.status(401).json({ message: 'User not authorized' });
    }

    const calls = await Call.find({
      $or: [
        {participants: { $in: [userId]}},
        {caller: userId }
      ],
      status: { $in: ['ended', 'active', 'ringing', 'initiating'] }
    })
      .select('-connectionData')
      .sort('-startTime')
      .populate('caller', 'Phone countryCode avatar')
      .populate('participants', 'Phone countryCode avatar')
      .populate('chatId', 'name')

    if(!calls){
      console.log('No calls availablr')
      return res.status(404).json({message: 'No calls available'})
    }

    // console.log('CALLS FOUND:', calls);
    res.json({
      calls,
      message: 'Call history retrieved'
    });
  } catch (error) {
    console.error('Error fetching call history:', error);
    res.status(500).json({
      error: 'Failed to get call history',
      details: error.message
    });
  }
};


export {initiateCall, getCallHistory}