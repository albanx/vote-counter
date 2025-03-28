import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Vote from '@/models/Vote';
import { UAParser } from 'ua-parser-js';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const { region, city, kzaz, userId } = req.query;
        
        // Build query based on provided filters
        const query: any = {};
        if (region) query.region = region;
        if (city) query.city = city;
        if (kzaz) query.kzaz = kzaz;
        if (userId) query.userId = userId;

        const votes = await Vote.find(query).sort({ createdAt: -1 });
        res.status(200).json(votes);
      } catch (error: any) {
        console.error('Error fetching votes:', error);
        res.status(500).json({ 
          message: 'Error fetching votes', 
          error: error.message || 'Unknown error occurred' 
        });
      }
      break;

    case 'POST':
      try {
        const { userId, type, timestamp, region, city, kzaz } = req.body;

        // Get IP address
        const ip = req.headers['x-forwarded-for'] || 
                  req.socket.remoteAddress ||
                  null;

        // Parse user agent
        const ua = new UAParser(req.headers['user-agent']);
        const browser = ua.getBrowser();
        const os = ua.getOS();

        const vote = new Vote({
          userId,
          type,
          timestamp,
          region,
          city,
          kzaz,
          deviceInfo: {
            ip: ip || 'unknown',
            userAgent: req.headers['user-agent'] || 'unknown',
            browser: `${browser.name} ${browser.version}` || 'unknown',
            os: `${os.name} ${os.version}` || 'unknown'
          }
        });

        await vote.save();

        res.status(201).json({ message: 'Vote recorded successfully', vote });
      } catch (error: any) {
        console.error('Error recording vote:', error);
        res.status(500).json({ 
          message: 'Error recording vote', 
          error: error.message || 'Unknown error occurred' 
        });
      }
      break;

    default:
      res.status(405).json({ message: 'Method not allowed' });
  }
}
