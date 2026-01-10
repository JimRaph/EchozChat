import { Router } from 'express';
import { userProtect } from '../middlewares/auth.js';
import { 
  initiateCall,
  getCallHistory,
} from '../controllers/callController.js';

const routerCall = Router();

// Initiate a new call
routerCall.post('/calls/initiate', userProtect, initiateCall);

// End an ongoing call
// routerCall.put('/calls/:callId/end', userProtect, endCall);

// Get call history for user
routerCall.get('/calls/history', userProtect, getCallHistory);

// Reject an incoming call
// routerCall.post('/calls/:callId/reject', userProtect, rejectCall);

// Get specific call details
// routerCall.get('/calls/:callId', userProtect, getCallDetails);

export default routerCall;