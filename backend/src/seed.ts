import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User';
import Issue from './models/Issue';
import Vote from './models/Vote';

dotenv.config();

const categories = [
  'pothole', 'streetlight', 'garbage', 'drainage', 'water_supply',
  'encroachment', 'noise', 'stray_animals', 'other',
] as const;

const statuses = ['pending', 'under_review', 'in_progress', 'resolved', 'rejected'] as const;

const wards = ['Ward-1 Connaught Place', 'Ward-2 Karol Bagh', 'Ward-3 Chandni Chowk', 'Ward-4 Saket', 'Ward-5 Dwarka'];
const departments = ['Roads & Infrastructure', 'Water Supply', 'Electricity', 'Sanitation', 'General Maintenance'];

const issueTitles: Record<string, string[]> = {
  pothole: ['Large pothole on main road near market', 'Deep pothole causing accidents near school zone', 'Multiple potholes after rain damage', 'Pothole on highway service road', 'Crater-sized pothole near bus stop'],
  streetlight: ['Street light not working for 2 weeks', 'Flickering streetlight creating hazard', 'Broken lamp post on residential street', 'No street lights in entire colony', 'Damaged streetlight after storm'],
  garbage: ['Garbage pile overflowing on street corner', 'No garbage collection for 5 days', 'Illegal dumping site near residential area', 'Overflowing community dustbin', 'Construction waste dumped on footpath'],
  drainage: ['Blocked drain causing waterlogging', 'Open drain cover is a safety hazard', 'Sewage overflow in residential area', 'Drain water entering homes during rain', 'Broken drainage pipe leaking on road'],
  water_supply: ['No water supply for 3 days', 'Low water pressure in entire block', 'Contaminated water supply reported', 'Leaking water pipeline on main road', 'Irregular water timing causing issues'],
  encroachment: ['Illegal shop encroaching on footpath', 'Vendor blocking pedestrian walkway', 'Construction material blocking road', 'Parked vehicles blocking emergency access', 'Unauthorized construction on public land'],
  noise: ['Construction noise during night hours', 'Loudspeaker noise from event venue', 'Factory noise exceeding permissible levels', 'Traffic noise at residential intersection', 'Ongoing honking near hospital zone'],
  stray_animals: ['Aggressive stray dogs near school', 'Cattle roaming on busy highway', 'Stray dog menace in residential colony', 'Injured stray animal needs rescue', 'Monkey menace damaging property'],
  other: ['Damaged road divider needs repair', 'Missing traffic signal at intersection', 'Broken bench in public park', 'Damaged public toilet facility', 'Fallen tree blocking road'],
};

const descriptions: Record<string, string> = {
  pothole: 'There is a severe pothole on this stretch of road that has been causing damage to vehicles and poses a risk to two-wheeler riders. Multiple residents have complained about this. Urgent repair needed.',
  streetlight: 'The streetlight at this location has stopped functioning, making the area very dark at night. This is a safety concern as there have been incidents of theft reported. Please fix urgently.',
  garbage: 'Garbage has been piling up at this location for several days. The municipal collection service has not been regular, and the area is becoming a health hazard with flies and mosquitoes breeding.',
  drainage: 'The drainage system at this location is severely clogged, causing water to accumulate on the road during even light rainfall. This leads to traffic disruptions and mosquito breeding.',
  water_supply: 'Residents in this area have been experiencing water supply issues. The supply has been irregular and the water pressure is extremely low, causing significant inconvenience to families.',
  encroachment: 'There is unauthorized encroachment at this location blocking the public pathway. Pedestrians are forced to walk on the road, creating a dangerous situation especially during peak traffic hours.',
  noise: 'Excessive noise pollution from this area is causing disturbance to nearby residents, especially during late evening and night hours. This violates the noise pollution regulations.',
  stray_animals: 'Stray animals in this area are becoming a serious concern. They have been aggressive towards passersby and children are particularly at risk. Animal control intervention needed.',
  other: 'This issue at the reported location needs attention from the municipal authorities. It has been causing inconvenience to residents and visitors in the area for quite some time now.',
};

// Generate random coordinates around Delhi (28.6139, 77.2090)
const randomDelhiCoord = () => ({
  lat: 28.6139 + (Math.random() - 0.5) * 0.1,
  lng: 77.209 + (Math.random() - 0.5) * 0.1,
});

const addresses = [
  'Connaught Place, New Delhi, Delhi 110001',
  'Karol Bagh, New Delhi, Delhi 110005',
  'Chandni Chowk, Old Delhi, Delhi 110006',
  'Saket, New Delhi, Delhi 110017',
  'Dwarka Sector 12, New Delhi, Delhi 110075',
  'Lajpat Nagar, New Delhi, Delhi 110024',
  'Rajouri Garden, New Delhi, Delhi 110027',
  'Rohini Sector 7, New Delhi, Delhi 110085',
  'Vasant Kunj, New Delhi, Delhi 110070',
  'Janakpuri, New Delhi, Delhi 110058',
  'Greater Kailash, New Delhi, Delhi 110048',
  'Nehru Place, New Delhi, Delhi 110019',
  'Hauz Khas, New Delhi, Delhi 110016',
  'Pitampura, New Delhi, Delhi 110034',
  'Mayur Vihar Phase 1, New Delhi, Delhi 110091',
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Issue.deleteMany({}),
      Vote.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create admins
    const admins = await User.create([
      { name: 'Amit Kumar Singh', email: 'admin@civicpulse.in', password: 'admin123', role: 'admin', ward: 'All', department: 'Administration', isVerified: true },
      { name: 'Priya Sharma', email: 'admin2@civicpulse.in', password: 'admin123', role: 'admin', ward: 'All', department: 'Administration', isVerified: true },
    ]);
    console.log('👑 Created 2 admin accounts');

    // Create officials
    const officials = await User.create([
      { name: 'Amit Verma', email: 'amit.official@civicpulse.in', password: 'official123', role: 'official', ward: wards[0], department: departments[0], isVerified: true },
      { name: 'Sunita Gupta', email: 'sunita.official@civicpulse.in', password: 'official123', role: 'official', ward: wards[1], department: departments[1], isVerified: true },
      { name: 'Vikram Singh', email: 'vikram.official@civicpulse.in', password: 'official123', role: 'official', ward: wards[2], department: departments[2], isVerified: true },
      { name: 'Deepa Nair', email: 'deepa.official@civicpulse.in', password: 'official123', role: 'official', ward: wards[3], department: departments[3], isVerified: true },
      { name: 'Rahul Joshi', email: 'rahul.official@civicpulse.in', password: 'official123', role: 'official', ward: wards[4], department: departments[4], isVerified: true },
    ]);
    console.log('🏛️  Created 5 official accounts');

    // Create citizens
    const citizenNames = [
      'Arun Patel', 'Meera Reddy', 'Sanjay Mishra', 'Kavita Jain', 'Nikhil Agarwal',
      'Ritu Saxena', 'Deepak Yadav', 'Ananya Mukherjee', 'Varun Kapoor', 'Pooja Bhatia',
      'Manoj Tiwari', 'Sneha Desai', 'Rohit Malhotra', 'Divya Chauhan', 'Karan Mehta',
      'Swati Pandey', 'Arjun Nambiar', 'Neha Srivastava', 'Gaurav Tandon', 'Pallavi Iyer',
    ];

    const citizens = await User.create(
      citizenNames.map((name, i) => ({
        name,
        email: `citizen${i + 1}@example.com`,
        password: 'citizen123',
        role: 'citizen' as const,
        isVerified: true,
        reportCount: Math.floor(Math.random() * 5),
      }))
    );
    console.log('👥 Created 20 citizen accounts');

    // Create 50 issues
    const issues = [];
    for (let i = 0; i < 50; i++) {
      const cat = categories[i % categories.length];
      const titles = issueTitles[cat];
      const title = titles[i % titles.length];
      const coord = randomDelhiCoord();
      const statusIdx = Math.floor(Math.random() * statuses.length);
      const status = statuses[statusIdx];
      const voteCount = Math.floor(Math.random() * 50);
      const reporter = citizens[Math.floor(Math.random() * citizens.length)];
      const assignedOfficial = Math.random() > 0.5 ? officials[Math.floor(Math.random() * officials.length)] : null;
      const daysAgo = Math.floor(Math.random() * 60);
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      const urgencyBoost = Math.max(0, 30 - daysAgo);
      const priority = voteCount * 2 + urgencyBoost;

      const issue: any = {
        title,
        description: descriptions[cat],
        category: cat,
        status,
        priority,
        location: { type: 'Point', coordinates: [coord.lng, coord.lat] },
        address: addresses[Math.floor(Math.random() * addresses.length)],
        ward: wards[Math.floor(Math.random() * wards.length)],
        photos: [],
        reportedBy: reporter._id,
        assignedTo: assignedOfficial?._id || undefined,
        voteCount,
        voters: [],
        statusHistory: [{ status: 'pending', changedBy: reporter._id, changedAt: createdAt, note: 'Issue reported' }],
        createdAt,
        updatedAt: createdAt,
      };

      if (status === 'resolved') {
        issue.resolvedAt = new Date(createdAt.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000);
        issue.officialComment = 'This issue has been resolved. Thank you for reporting.';
      }
      if (status === 'rejected') {
        issue.rejectionReason = 'This issue falls outside municipal jurisdiction or is a duplicate report.';
      }
      if (status !== 'pending') {
        issue.statusHistory.push({
          status,
          changedBy: assignedOfficial?._id || admins[0]._id,
          changedAt: new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000),
          note: `Status changed to ${status}`,
        });
      }

      issues.push(issue);
    }

    await Issue.insertMany(issues);
    console.log('📋 Created 50 sample issues across Delhi');

    // Add some votes
    const createdIssues = await Issue.find().lean();
    const voteDocs = [];
    for (const issue of createdIssues) {
      const voterCount = Math.min(issue.voteCount, citizens.length);
      const shuffled = [...citizens].sort(() => Math.random() - 0.5).slice(0, voterCount);
      const voterIds = shuffled.map((c) => c._id);

      await Issue.findByIdAndUpdate(issue._id, { voters: voterIds });

      for (const voterId of voterIds) {
        voteDocs.push({ issue: issue._id, user: voterId });
      }
    }
    if (voteDocs.length > 0) {
      await Vote.insertMany(voteDocs, { ordered: false }).catch(() => {});
    }
    console.log('🗳️  Added votes to issues');

    console.log('\n✅ Seed complete!');
    console.log('\n📌 Login credentials:');
    console.log('  Admin:    admin@civicpulse.in / admin123');
    console.log('  Official: amit.official@civicpulse.in / official123');
    console.log('  Citizen:  citizen1@example.com / citizen123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
