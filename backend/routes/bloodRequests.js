import express from 'express';
import twilio from 'twilio';
import BloodRequest from '../models/BloodRequest.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Twilio configuration
const accountSid = 'AC1ea983056b04621ab3004bac9ef828ca';
const authToken = 'ab28e76fd4ba32dbd720bdd722585802';
const client = twilio(accountSid, authToken);

// Create blood request and send SMS to donors
router.post('/create-request', protect, async (req, res) => {
  try {
    const { patientName, bloodGroup, unitsNeeded, urgency, donors } = req.body;
    
    // Generate unique request ID
    const requestId = Math.random().toString(36).slice(2, 15);
    
    // Create blood request
    const bloodRequest = new BloodRequest({
      requestId,
      doctorId: req.user._id,
      patientName,
      bloodGroup,
      unitsNeeded,
      urgency,
      location: {
        latitude: 19.0760, // You can get this from doctor's profile
        longitude: 72.8777
      },
      donorResponses: []
    });

    // Process each donor and send SMS
    const donorResponses = [];
    const smsPromises = [];

    for (let i = 0; i < donors.length; i++) {
      const donor = donors[i];
      const uniqueToken = Math.random().toString(36).slice(2, 15);
      const uniqueLink = `https://vi-tally.vercel.app/donor/respond/${requestId}/${uniqueToken}`;
      
      const donorResponse = {
        donorId: donor.donor_id.toString(),
        donorName: donor.name,
        donorPhone: donor.phone || `+91${9000000000 + i}`, // Mock phone numbers for demo
        bloodGroup: donor.blood_group,
        compatibilityScore: donor.compatibility_score,
        distanceKm: donor.distance_km,
        uniqueLink: uniqueLink,
        status: 'pending'
      };

      donorResponses.push(donorResponse);

      // SMS content
      const smsMessage = `🩸 URGENT BLOOD DONATION REQUEST 🩸\n\nHi ${donor.name}!\n\nA patient needs ${bloodGroup} blood urgently at a nearby hospital.\n\nYour compatibility: ${donor.compatibility_score.toFixed(1)}%\nDistance: ${donor.distance_km.toFixed(1)}km\n\nCan you help save a life?\n\nRespond here: ${uniqueLink}\n\n⏰ Every minute counts!`;

      // Add SMS sending promise
      const smsPromise = client.messages.create({
        body: smsMessage,
        from: '+1234567890', // Your Twilio phone number
        to: donorResponse.donorPhone
      }).then(message => {
        donorResponse.smsStatus = 'sent';
        donorResponse.smsSid = message.sid;
        console.log(`SMS sent to ${donor.name}: ${message.sid}`);
      }).catch(error => {
        donorResponse.smsStatus = 'failed';
        console.error(`SMS failed for ${donor.name}:`, error.message);
      });

      smsPromises.push(smsPromise);
    }

    // Wait for all SMS to be sent
    await Promise.allSettled(smsPromises);

    // Save donor responses to blood request
    bloodRequest.donorResponses = donorResponses;
    await bloodRequest.save();

    res.status(201).json({
      success: true,
      data: bloodRequest,
      message: `Blood request created and SMS sent to ${donors.length} donors`
    });

  } catch (error) {
    console.error('Error creating blood request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create blood request and send SMS'
    });
  }
});

// Get blood request status
router.get('/status/:requestId', protect, async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findOne({ 
      requestId: req.params.requestId,
      doctorId: req.user._id 
    });

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        error: 'Blood request not found'
      });
    }

    res.json({
      success: true,
      data: bloodRequest
    });

  } catch (error) {
    console.error('Error fetching blood request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blood request status'
    });
  }
});

// Handle donor response (public endpoint)
router.post('/donor-response/:requestId/:token', async (req, res) => {
  try {
    const { requestId, token } = req.params;
    const { response, donorInfo } = req.body; // 'accepted' or 'declined'

    // Find the blood request and specific donor response
    const bloodRequest = await BloodRequest.findOne({ requestId });

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        error: 'Blood request not found'
      });
    }

    // Find the specific donor response by token in the link
    const donorResponseIndex = bloodRequest.donorResponses.findIndex(
      dr => dr.uniqueLink.includes(token)
    );

    if (donorResponseIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Invalid response link'
      });
    }

    // Update donor response
    bloodRequest.donorResponses[donorResponseIndex].status = response;
    bloodRequest.donorResponses[donorResponseIndex].responseDate = new Date();

    await bloodRequest.save();

    res.json({
      success: true,
      message: `Thank you! Your response has been recorded.`,
      data: {
        donorName: bloodRequest.donorResponses[donorResponseIndex].donorName,
        response: response,
        patientName: bloodRequest.patientName
      }
    });

  } catch (error) {
    console.error('Error processing donor response:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process donor response'
    });
  }
});

// Get donor response page data (public endpoint)
router.get('/donor-info/:requestId/:token', async (req, res) => {
  try {
    const { requestId, token } = req.params;

    const bloodRequest = await BloodRequest.findOne({ requestId });

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        error: 'Blood request not found'
      });
    }

    // Find the specific donor response by token
    const donorResponse = bloodRequest.donorResponses.find(
      dr => dr.uniqueLink.includes(token)
    );

    if (!donorResponse) {
      return res.status(404).json({
        success: false,
        error: 'Invalid response link'
      });
    }

    res.json({
      success: true,
      data: {
        requestId,
        patientName: bloodRequest.patientName,
        bloodGroup: bloodRequest.bloodGroup,
        unitsNeeded: bloodRequest.unitsNeeded,
        urgency: bloodRequest.urgency,
        donorName: donorResponse.donorName,
        donorBloodGroup: donorResponse.bloodGroup,
        compatibilityScore: donorResponse.compatibilityScore,
        distanceKm: donorResponse.distanceKm,
        currentStatus: donorResponse.status
      }
    });

  } catch (error) {
    console.error('Error fetching donor info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch donor information'
    });
  }
});

export default router;
