const SosAlert = require('../models/SosAlert');
const Guardian = require('../models/Guardian');
const { getIO } = require('../config/socket');
const twilio = require('twilio');
const { sendSosEmergencyEmail } = require('../config/email');

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const sendSMSToGuardian = async (guardian, alertData) => {
  const smsBody = `EMERGENCY ALERT from Safe-Era\n\n${alertData.userName} needs immediate help!\n\nLocation: ${alertData.googleMapsLink}\n\nCall them: ${alertData.userPhone}\n\nThis alert was sent automatically by Safe-Era safety app.`;
  
  if (!twilioClient) {
    console.log('[MOCK SMS] Would send to:', guardian.guardianPhone, 'Message:', smsBody);
    return { success: true, mock: true };
  }

  try {
    await twilioClient.messages.create({
      body: smsBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: guardian.guardianPhone
    });
    return { success: true };
  } catch (error) {
    console.error('SMS failed for', guardian.guardianPhone, error.message);
    return { success: false };
  }
};

const triggerSos = async (req, res) => {
  try {
    const { latitude, longitude, message, triggerSource, threatScore, threatDetails } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: "Latitude and longitude are required" });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ success: false, message: "Invalid latitude or longitude" });
    }

    const existingAlert = await SosAlert.findOne({ userId: req.userId, status: 'active' });
    const googleMapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
    
    let sosAlert = existingAlert;
    let isNewAlert = false;

    if (!sosAlert) {
      isNewAlert = true;
      sosAlert = new SosAlert({
        userId: req.userId,
        latitude,
        longitude,
        message: message || (triggerSource === 'threat_detection' ? 'AUTOMATIC AI THREAT ESCALATION DETECTED' : (triggerSource === 'voice_trigger' ? 'VOICE TRIGGERED EMERGENCY SOS' : 'I need help!')),
        googleMapsLink,
        status: 'active',
        triggerSource: triggerSource || 'manual_button',
        threatScore: threatScore || (triggerSource === 'threat_detection' ? 85 : 0),
        threatDetails: threatDetails || {}
      });
    } else {
      // Re-trigger / update existing alert with refreshed location and threat info
      sosAlert.latitude = latitude;
      sosAlert.longitude = longitude;
      sosAlert.googleMapsLink = googleMapsLink;
      sosAlert.threatScore = Math.max(sosAlert.threatScore || 0, threatScore || (triggerSource === 'threat_detection' ? 85 : 0));
      if (threatDetails) {
        sosAlert.threatDetails = {
          ...sosAlert.threatDetails,
          ...threatDetails
        };
      }
      if (message) {
        sosAlert.message = message;
      }
      sosAlert.triggerSource = triggerSource || sosAlert.triggerSource;
    }

    const guardians = await Guardian.find({ userId: req.userId, isActive: true });
    
    const alertData = {
      userName: req.user.name,
      userPhone: req.user.phone,
      googleMapsLink
    };

    let smsSentCount = 0;
    let smsFailedCount = 0;

    if (guardians && guardians.length > 0) {
      const smsResults = await Promise.allSettled(guardians.map(g => sendSMSToGuardian(g, alertData)));
      
      smsResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value.success) {
          smsSentCount++;
        } else {
          smsFailedCount++;
        }
      });

      sosAlert.guardiansAlerted = guardians.length;
      sosAlert.smsSentCount = smsSentCount;
      sosAlert.smsFailedCount = smsFailedCount;
    }

    // Send Emergency Email directly to all active guardians with configured emails
    let emailSentCount = 0;
    let emailRecipients = (guardians || [])
      .filter(g => g.guardianEmail && g.guardianEmail.trim() !== '')
      .map(g => ({ email: g.guardianEmail.trim(), name: g.guardianName }));

    // Only fallback to user's personal email if no guardian email was configured at all
    if (emailRecipients.length === 0 && req.user.email) {
      emailRecipients.push({ email: req.user.email, name: req.user.name + ' (User Account Fallback)' });
    }

    let emailPreviewUrl = null;
    if (emailRecipients.length > 0) {
      const emailResults = await Promise.allSettled(
        emailRecipients.map(r => sendSosEmergencyEmail({
          toEmail: r.email,
          guardianName: r.name,
          userName: req.user.name,
          userPhone: req.user.phone,
          locationLink: googleMapsLink,
          threatScore: sosAlert.threatScore,
          triggerSource: sosAlert.triggerSource,
          time: new Date().toLocaleTimeString()
        }))
      );
      emailResults.forEach(res => {
        if (res.status === 'fulfilled' && res.value?.success) {
          emailSentCount++;
          if (res.value.previewUrl && !emailPreviewUrl) {
            emailPreviewUrl = res.value.previewUrl;
          }
        }
      });
    }

    sosAlert.emailSentCount = emailSentCount;
    sosAlert.emailPreviewUrl = emailPreviewUrl;
    await sosAlert.save();

    const alertBroadcastPayload = {
      alertId: sosAlert._id,
      _id: sosAlert._id,
      userId: {
        _id: req.userId,
        name: req.user.name,
        phone: req.user.phone,
        email: req.user.email
      },
      userName: req.user.name,
      userPhone: req.user.phone,
      latitude,
      longitude,
      googleMapsLink,
      message: sosAlert.message,
      triggerSource: sosAlert.triggerSource,
      threatScore: sosAlert.threatScore,
      threatDetails: sosAlert.threatDetails,
      status: sosAlert.status,
      icccStatus: sosAlert.icccStatus,
      createdAt: sosAlert.createdAt,
      timestamp: sosAlert.createdAt,
      guardiansAlerted: sosAlert.guardiansAlerted,
      emailSentCount,
      emailPreviewUrl
    };

    // Emit to user's guardian room AND global ICCC command room
    io.to("sos_" + req.userId).emit("sos-triggered", alertBroadcastPayload);
    io.to("iccc_room").emit("iccc-new-incident", alertBroadcastPayload);

    return res.status(isNewAlert ? 201 : 200).json({
      success: true,
      message: `SOS alert ${isNewAlert ? 'triggered' : 'refreshed and broadcasted'} via ${sosAlert.triggerSource}`,
      alert: sosAlert,
      guardiansAlerted: sosAlert.guardiansAlerted,
      smsSent: smsSentCount,
      smsFailed: smsFailedCount,
      emailSent: emailSentCount,
      emailPreviewUrl
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const cancelSos = async (req, res) => {
  try {
    const alert = await SosAlert.findOne({ userId: req.userId, status: 'active' });
    
    if (!alert) {
      return res.status(404).json({ success: false, message: "No active SOS alert found" });
    }

    alert.status = 'cancelled';
    alert.cancelledAt = new Date();
    await alert.save();

    const io = getIO();
    io.to("sos_" + req.userId).emit("sos-cancelled", {
      userName: req.user.name,
      timestamp: new Date()
    });
    io.to("iccc_room").emit("iccc-incident-updated", {
      alertId: alert._id,
      status: 'cancelled',
      cancelledAt: alert.cancelledAt
    });

    const guardians = await Guardian.find({ userId: req.userId });
    if (guardians && guardians.length > 0) {
      const smsBody = `FALSE ALARM - ${req.user.name} is safe. The SOS alert has been cancelled.`;
      
      const sendSMS = async (guardian) => {
        if (!twilioClient) {
          console.log('[MOCK SMS] Would send to:', guardian.guardianPhone, 'Message:', smsBody);
          return { success: true, mock: true };
        }
        try {
          await twilioClient.messages.create({
            body: smsBody,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: guardian.guardianPhone
          });
          return { success: true };
        } catch (error) {
          return { success: false };
        }
      };

      await Promise.allSettled(guardians.map(g => sendSMS(g)));
    }

    return res.status(200).json({ success: true, message: "SOS alert cancelled. Guardians have been notified." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const markSafe = async (req, res) => {
  try {
    const alert = await SosAlert.findOne({ userId: req.userId, status: 'active' });
    
    if (!alert) {
      return res.status(404).json({ success: false, message: "No active SOS alert found" });
    }

    alert.status = 'resolved';
    alert.resolved = true;
    alert.resolvedAt = new Date();
    alert.icccStatus = 'resolved';
    await alert.save();

    const io = getIO();
    io.to("sos_" + req.userId).emit("user-safe", {
      userName: req.user.name,
      timestamp: alert.resolvedAt
    });
    io.to("iccc_room").emit("iccc-incident-updated", {
      alertId: alert._id,
      status: 'resolved',
      icccStatus: 'resolved',
      resolvedAt: alert.resolvedAt
    });

    const guardians = await Guardian.find({ userId: req.userId });
    if (guardians && guardians.length > 0) {
      const smsBody = `SAFE - ${req.user.name} is now safe. The emergency has been resolved.`;
      
      const sendSMS = async (guardian) => {
        if (!twilioClient) {
          console.log('[MOCK SMS] Would send to:', guardian.guardianPhone, 'Message:', smsBody);
          return { success: true, mock: true };
        }
        try {
          await twilioClient.messages.create({
            body: smsBody,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: guardian.guardianPhone
          });
          return { success: true };
        } catch (error) {
          return { success: false };
        }
      };

      await Promise.allSettled(guardians.map(g => sendSMS(g)));
    }

    return res.status(200).json({ success: true, message: "You are now marked as safe", alert });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSosHistory = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { userId: req.userId };
    
    if (status && ['active', 'resolved', 'cancelled'].includes(status)) {
      query.status = status;
    }
    
    const alerts = await SosAlert.find(query).sort({ createdAt: -1 }).limit(20);
    return res.status(200).json({ success: true, count: alerts.length, alerts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getActiveSos = async (req, res) => {
  try {
    const alert = await SosAlert.findOne({ userId: req.userId, status: 'active' });
    
    if (!alert) {
      return res.status(200).json({ success: true, hasActiveAlert: false });
    }

    return res.status(200).json({ success: true, hasActiveAlert: true, alert });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ICCC Command Dashboard Controllers ─────────────────────────────

const getIcccIncidents = async (req, res) => {
  try {
    const incidents = await SosAlert.find()
      .populate('userId', 'name phone email')
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      count: incidents.length,
      incidents
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateIcccIncidentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { icccStatus, note } = req.body;

    if (!['unassigned', 'responding', 'resolved'].includes(icccStatus)) {
      return res.status(400).json({ success: false, message: "Invalid icccStatus" });
    }

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const io = getIO();
      const updatePayload = {
        alertId: id,
        icccStatus,
        status: icccStatus === 'resolved' ? 'resolved' : 'active',
        icccOperatorNote: note || ''
      };
      io.to("iccc_room").emit("iccc-incident-updated", updatePayload);
      return res.status(200).json({
        success: true,
        message: `Incident status updated to ${icccStatus}`,
        alert: { _id: id, icccStatus, status: icccStatus === 'resolved' ? 'resolved' : 'active' }
      });
    }

    const alert = await SosAlert.findById(id).populate('userId', 'name phone');
    if (!alert) {
      return res.status(404).json({ success: false, message: "Incident not found" });
    }

    alert.icccStatus = icccStatus;
    if (note !== undefined) alert.icccOperatorNote = note;
    if (icccStatus === 'responding') {
      alert.icccRespondedAt = new Date();
    } else if (icccStatus === 'resolved') {
      alert.status = 'resolved';
      alert.resolved = true;
      alert.resolvedAt = new Date();
    }

    await alert.save();

    const victimUserId = alert.userId?._id ? alert.userId._id.toString() : alert.userId.toString();
    const updatePayload = {
      alertId: alert._id,
      userId: victimUserId,
      victimName: alert.userId?.name || alert.userName || 'Citizen',
      icccStatus: alert.icccStatus,
      status: alert.status,
      icccOperatorNote: alert.icccOperatorNote || (icccStatus === 'responding' ? 'PCR Patrol Unit 112 Dispatched to live coordinates' : 'Incident resolved by Control Room 112'),
      resolvedAt: alert.resolvedAt,
      icccRespondedAt: alert.icccRespondedAt,
      timestamp: new Date(),
      message: icccStatus === 'responding'
        ? (alert.icccOperatorNote || '🚨 PCR Patrol Unit 112 Dispatched to your coordinates')
        : 'Emergency incident resolved by Control Room 112'
    };

    io.to("iccc_room").emit("iccc-incident-updated", { ...updatePayload, alert });
    io.to("sos_" + victimUserId).emit("iccc-status-updated", updatePayload);
    // Broadcast for open citizen active SOS monitors
    io.emit("iccc-status-updated", updatePayload);

    if (icccStatus === 'resolved') {
      io.to("sos_" + victimUserId).emit("user-safe", {
        userName: alert.userId?.name || alert.userName || 'Citizen',
        timestamp: alert.resolvedAt
      });
      io.emit("user-safe", {
        alertId: alert._id,
        userId: victimUserId,
        timestamp: alert.resolvedAt
      });
    }

    return res.status(200).json({
      success: true,
      message: `Incident status updated to ${icccStatus}`,
      alert
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  triggerSos,
  cancelSos,
  markSafe,
  getSosHistory,
  getActiveSos,
  getIcccIncidents,
  updateIcccIncidentStatus
};

