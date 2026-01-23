const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Article = require('../models/Article');

dotenv.config();

const articles = [
  {
    title: 'UPS Announces New Delivery Options for 2024',
    description: 'UPS has launched new same-day delivery options for select markets. This expansion aims to improve service quality for family-owned parcel stores and their customers.',
    content: `UPS has officially announced its new same-day delivery service expansion for 2024. The rollout will affect major metropolitan areas across the United States, providing faster delivery times for both residential and commercial customers.

This initiative comes as part of UPS's broader effort to compete with other major carriers and meet growing customer expectations for rapid delivery. Family-owned parcel stores will benefit from improved logistics infrastructure and better tracking systems.

Key features of the new service include:
• Real-time package tracking
• Flexible delivery windows
• Signature-optional options
• Enhanced customer support

Store owners should prepare for increased package volumes during peak seasons. Contact your UPS representative for more details on how this affects your store's operations.`,
    category: 'UPS',
    author: 'RS News Team',
    date: new Date('2024-01-23'),
    readTime: 5,
    featured: true,
    image: 'https://via.placeholder.com/800x400?text=UPS+Delivery'
  },
  {
    title: 'FedEx Updates Service Standards and Cutoff Times',
    description: 'FedEx has updated its service standards and cutoff times for 2024. Learn how these changes may impact your store operations and customer expectations.',
    content: `FedEx has announced important updates to its service standards that take effect this quarter. These changes are designed to improve reliability and consistency across all service levels.

The updated cutoff times will affect both pickup and drop-off locations nationwide. Store owners should update their operational schedules accordingly.

New Cutoff Times:
• FedEx Ground: 5:00 PM (local time)
• FedEx Express: 6:00 PM (local time)
• FedEx Home Delivery: 4:30 PM (local time)

Additionally, FedEx has introduced new tracking capabilities that provide customers with more precise delivery windows. This should help reduce inquiries and improve customer satisfaction at your store.

For a complete list of changes and regional variations, visit FedEx's official website or contact your account representative.`,
    category: 'FedEx',
    author: 'RS News Team',
    date: new Date('2024-01-20'),
    readTime: 4,
    featured: true,
    image: 'https://via.placeholder.com/800x400?text=FedEx+Services'
  },
  {
    title: 'USPS Announces New Shipping Rates for Q1 2024',
    description: 'USPS has announced new shipping rates effective this quarter. Review the new pricing structure for your store to ensure accurate customer billing.',
    content: `The United States Postal Service has released its new shipping rate schedule for the first quarter of 2024. These changes affect Priority Mail, Priority Express, and Parcel Select services.

Average rate increases range from 5-12% depending on service level and destination. Store owners should review these changes carefully to update their pricing structure and customer communications.

Key Price Changes:
• Priority Mail (1-3 days): Up to 12% increase
• Priority Express (overnight): Up to 8% increase
• Parcel Select (2-8 days): Up to 7% increase
• First Class Package Service: Up to 6% increase

USPS has provided detailed rate cards for each ZIP code, which are available on their official website. We recommend updating your pricing systems and informing customers of changes that affect them.

The rate increases reflect USPS's commitment to maintaining service quality and investing in infrastructure improvements.`,
    category: 'USPS',
    author: 'RS News Team',
    date: new Date('2024-01-15'),
    readTime: 6,
    featured: true,
    image: 'https://via.placeholder.com/800x400?text=USPS+Rates'
  },
  {
    title: 'DHL Expands Ground Services Nationwide',
    description: 'DHL continues to expand its ground services network to reach more customers across the country. This expansion brings new opportunities for parcel stores.',
    content: `DHL Express has announced a significant expansion of its ground services network across the United States. The expansion will add new pickup and delivery locations in underserved areas, benefiting both residential and commercial customers.

This initiative represents DHL's commitment to competing in the domestic parcel delivery market while maintaining its international shipping expertise. Family-owned parcel stores can expect improved service availability and competitive shipping options for their customers.

Expansion Highlights:
• 150 new service locations added nationwide
• Enhanced Saturday delivery in select markets
• Improved tracking and visibility
• Dedicated support for small business customers

Store owners can now offer DHL services to a broader customer base. Consider adding DHL to your service offerings if you haven't already. Contact DHL for partnership opportunities in your area.`,
    category: 'DHL',
    author: 'RS News Team',
    date: new Date('2024-01-10'),
    readTime: 4,
    featured: false,
    image: 'https://via.placeholder.com/800x400?text=DHL+Services'
  },
  {
    title: 'Industry Tips: Managing Peak Season Shipping Volumes',
    description: 'As we approach peak shipping season, here are essential tips for managing high package volumes and maintaining customer satisfaction at your parcel store.',
    content: `Peak shipping season can be challenging for parcel store operators. High volumes, demanding customers, and tight deadlines require careful planning and execution. Here are proven strategies to navigate the busy season successfully.

Staffing and Scheduling:
• Hire seasonal staff 4-6 weeks before peak season
• Create flexible shift schedules
• Provide thorough training on all carrier systems

Inventory Management:
• Stock up on packaging supplies early
• Maintain adequate label inventory
• Keep backup supplies for peak demand

Customer Communication:
• Post clear cutoff time information
• Educate customers about shipping deadlines
• Offer priority services for rush shipments

Technology and Systems:
• Update software and hardware
• Test backup systems
• Ensure reliable internet connectivity
• Implement queue management systems

Employee Wellness:
• Provide breaks and adequate rest
• Recognize employee contributions
• Maintain positive team morale

By implementing these strategies, you can minimize stress on your staff and provide excellent service to your customers during peak season.`,
    category: 'Tips',
    author: 'Sarah Mitchell',
    date: new Date('2024-01-08'),
    readTime: 7,
    featured: false,
    image: 'https://via.placeholder.com/800x400?text=Shipping+Tips'
  },
  {
    title: 'New Technology: Advanced Package Tracking Systems',
    description: 'Learn about the latest advancements in package tracking technology that can improve operations at your parcel store and enhance customer satisfaction.',
    content: `Modern package tracking technology has evolved significantly. Today's systems offer unprecedented visibility and real-time updates that customers have come to expect.

Benefits of Advanced Tracking:
• Real-time GPS location updates
• Estimated delivery times within 30-minute windows
• Automatic customer notifications
• Delivery proof with photos
• Customer signature capture

Implementing Advanced Systems:
Most major carriers (UPS, FedEx, USPS) now offer API integrations that allow parcel stores to access these tracking capabilities directly through their websites and point-of-sale systems.

For Your Store:
• Display tracking information on customer terminals
• Train staff on new tracking features
• Communicate benefits to customers
• Use data to improve service

By staying updated with the latest technology, you can offer your customers a competitive advantage and build loyalty through improved communication and transparency.`,
    category: 'Updates',
    author: 'John Anderson',
    date: new Date('2024-01-05'),
    readTime: 5,
    featured: false,
    image: 'https://via.placeholder.com/800x400?text=Technology+Updates'
  },
  {
    title: 'Regional Shipping Restrictions and Hazmat Guidelines',
    description: 'Stay informed about regional shipping restrictions and hazmat guidelines that affect what can be shipped from your parcel store location.',
    content: `Shipping regulations vary by region and carrier. It's crucial to understand what can and cannot be shipped to ensure compliance and protect your business.

Common Restricted Items:
• Lithium batteries
• Flammable liquids
• Compressed gases
• Biological materials
• Certain chemicals

Regional Variations:
Different states and municipalities have specific restrictions. For example, California has stricter regulations on hazardous materials compared to other states.

Action Items:
• Review your carrier's prohibited items list monthly
• Train staff on identification and handling
• Create clear signage for customers
• Maintain documentation of policies
• Report violations to appropriate carriers

Consequences of Non-Compliance:
• Fines and penalties
• Loss of carrier partnerships
• Damage to business reputation
• Potential legal liability

Stay informed through carrier newsletters and industry updates. Your compliance protects both your business and your customers.`,
    category: 'General',
    author: 'RS News Team',
    date: new Date('2024-01-02'),
    readTime: 6,
    featured: false,
    image: 'https://via.placeholder.com/800x400?text=Regulations'
  }
];

async function seedArticles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rs-news');
    console.log('MongoDB connected');

    // Clear existing articles
    await Article.deleteMany({});
    console.log('Cleared existing articles');

    // Insert new articles
    const result = await Article.insertMany(articles);
    console.log(`Successfully inserted ${result.length} articles`);

    console.log('\nSample articles created:');
    result.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding articles:', error);
    process.exit(1);
  }
}

seedArticles();
