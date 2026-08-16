// pages/api/applications/list.js (or app/api/applications/list/route.js for App Router)
import dbConnect from '../../../lib/mongodb';
import Application from '../../../models/Application';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Get query parameters for pagination and filtering
    const { 
      page = 1, 
      limit = 100, 
      status, 
      sector, 
      sortBy = 'submittedAt', 
      sortOrder = 'desc' 
    } = req.query || {};

    // Build filter object
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (sector && sector !== 'all') {
      filter.sector = sector;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch applications with pagination and sorting
    const applications = await Application.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Use lean() for better performance

    // Get total count for pagination
    const totalCount = await Application.countDocuments(filter);

    // Calculate statistics
    const stats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = {
      submitted: 0,
      'under-review': 0,
      accepted: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      if (statusStats.hasOwnProperty(stat._id)) {
        statusStats[stat._id] = stat.count;
      }
    });

    return res.status(200).json({
      success: true,
      applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalApplications: totalCount,
        hasNext: skip + applications.length < totalCount,
        hasPrev: parseInt(page) > 1
      },
      stats: statusStats
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
}