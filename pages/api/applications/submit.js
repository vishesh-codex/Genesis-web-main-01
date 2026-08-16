// pages/api/applications/submit.js

import { executeQuery } from '@/lib/db';
import { memoryStore } from '@/lib/memoryStore';
import dbConnect from '@/lib/mongodb';
import Application from '@/models/Application';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed', success: false });
  }

  try {
    const {
      fullName,
      applicant_name,
      name,
      dateOfBirth,
      email,
      mobile,
      phone,
      gender,
      city,
      state,
      otherState,
      currentStatus,
      otherStatus,
      institution,
      course,
      yearOfStudy,
      otherYear,
      startupName,
      startup_name,
      sector,
      otherSector,
      ideaDescription,
      problemSolving,
      targetCustomers,
      ideaStage,
      numTeamMembers,
      cofounders,
      willingToAttend,
      committedToWork,
      pitchDeckUrl,
      socialMedia,
      declaration,
      signature,
      signatureDate,
      track
    } = req.body || {};

    const applicantNameVal = String(fullName || applicant_name || name || '').trim();
    const emailVal = String(email || '').trim().toLowerCase();
    const phoneVal = String(mobile || phone || '').trim();
    const ideaDescVal = String(ideaDescription || '').trim();
    const startupNameVal = String(startupName || startup_name || '').trim();

    // Validate required fields
    if (!applicantNameVal || !emailVal) {
      return res.status(400).json({ 
        message: 'Applicant name and email are required fields',
        success: false 
      });
    }

    if (!memoryStore.applications) {
      memoryStore.applications = [];
    }

    // Check duplicate email in MySQL database
    let emailExistsInDb = false;
    try {
      const checkRes = await executeQuery(`SELECT id FROM applications WHERE LOWER(email) = LOWER(?) LIMIT 1`, [emailVal]);
      if (checkRes && checkRes.success && Array.isArray(checkRes.data) && checkRes.data.length > 0) {
        emailExistsInDb = true;
      }
    } catch (checkErr) {
      console.warn('DB check application email warning:', checkErr.message);
    }

    const emailExistsInMemory = memoryStore.applications.some(a => String(a.email || '').toLowerCase() === emailVal);

    if (emailExistsInDb || emailExistsInMemory) {
      return res.status(400).json({ 
        message: 'An application with this email already exists',
        success: false 
      });
    }

    const newAppId = Date.now();
    const nowIso = new Date().toISOString();
    const applicationPayload = {
      ...req.body,
      applicant_name: applicantNameVal,
      fullName: applicantNameVal,
      email: emailVal,
      phone: phoneVal,
      mobile: phoneVal,
      startup_name: startupNameVal,
      startupName: startupNameVal,
      track: track || 'startup',
      submitted_at: nowIso
    };

    const newMemoryApp = {
      id: newAppId,
      applicant_name: applicantNameVal,
      email: emailVal,
      phone: phoneVal,
      track: track || 'startup',
      startup_name: startupNameVal,
      status: 'pending',
      application_data: applicationPayload,
      created_at: nowIso
    };

    // 1. Primary: Save to MySQL database table `applications`
    let insertedId = newAppId;
    try {
      const insertQuery = `
        INSERT INTO applications (applicant_name, email, phone, track, startup_name, status, application_data, created_at)
        VALUES (?, ?, ?, ?, ?, 'pending', ?, NOW())
      `;
      const dbResult = await executeQuery(insertQuery, [
        applicantNameVal,
        emailVal,
        phoneVal,
        track || 'startup',
        startupNameVal,
        JSON.stringify(applicationPayload)
      ]);

      if (dbResult && dbResult.success && dbResult.data?.insertId) {
        insertedId = dbResult.data.insertId;
        newMemoryApp.id = insertedId;
      }
    } catch (dbErr) {
      console.warn('MySQL application insert error, saving to memoryStore fallback:', dbErr.message);
    }

    // Save to memoryStore
    memoryStore.applications.unshift(newMemoryApp);

    // 2. Secondary/Optional: Attempt Mongoose / MongoDB save if available, wrapped safely in try/catch
    try {
      if (dbConnect) {
        await dbConnect();
        const mongoApp = new Application({
          fullName: applicantNameVal,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
          email: emailVal,
          mobile: phoneVal,
          gender,
          city,
          state,
          otherState,
          currentStatus,
          otherStatus,
          institution,
          course,
          yearOfStudy,
          otherYear,
          startupName: startupNameVal,
          sector,
          otherSector,
          ideaDescription: ideaDescVal || 'No description provided',
          problemSolving,
          targetCustomers,
          ideaStage,
          numTeamMembers,
          cofounders: cofounders || [],
          willingToAttend,
          committedToWork,
          pitchDeckUrl,
          socialMedia,
          declaration,
          signature,
          signatureDate: signatureDate ? new Date(signatureDate) : new Date(),
        });
        await mongoApp.save();
      }
    } catch (mongoErr) {
      console.warn('MongoDB optional save skipped:', mongoErr.message);
    }

    return res.status(201).json({
      message: 'Application submitted successfully!',
      success: true,
      applicationId: insertedId,
      application: newMemoryApp
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    return res.status(500).json({
      message: 'Internal server error. Please try again later.',
      success: false,
    });
  }
}