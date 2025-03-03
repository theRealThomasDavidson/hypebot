// Sample profiles data for development and testing
const profiles = [
  {
    id: 1,
    name: "Alexandra Morgan",
    imageUrl: "https://randomuser.me/api/portraits/women/22.jpg",
    title: "AI Research Lead",
    bio: "Leading the latest innovations in computer vision and deep learning with published papers in top conferences.",
    profileUrl: "/profile/1",
    keywords: "AI research, computer vision, deep learning, machine learning",
    featured: true
  },
  {
    id: 2,
    name: "Marcus Chen",
    imageUrl: "https://randomuser.me/api/portraits/men/4.jpg", 
    title: "Robotics Engineer",
    bio: "Designs and builds advanced robotic systems with a focus on efficient hardware-software integration.",
    profileUrl: "/profile/2",
    keywords: "robotics, hardware design, mechatronics, control systems",
    featured: true
  },
  {
    id: 3,
    name: "Sophia Williams",
    imageUrl: "https://randomuser.me/api/portraits/women/9.jpg",
    title: "Data Science Lead",
    bio: "Expert in natural language processing and predictive analytics with experience at top tech companies.",
    profileUrl: "/profile/3",
    keywords: "data science, NLP, machine learning, statistics, python",
    featured: true
  },
  {
    id: 4,
    name: "Raj Patel",
    imageUrl: "https://randomuser.me/api/portraits/men/11.jpg",
    title: "Cloud Architect",
    bio: "Specializes in designing scalable cloud solutions and implementing modern DevOps practices.",
    profileUrl: "/profile/4",
    keywords: "cloud architecture, kubernetes, devops, AWS, Azure",
    featured: true
  },
  {
    id: 5,
    name: "Emma Johnson",
    imageUrl: "https://randomuser.me/api/portraits/women/33.jpg",
    title: "Frontend Developer",
    bio: "Passionate about creating intuitive user interfaces with React and modern JavaScript.",
    profileUrl: "/profile/5",
    keywords: "javascript, react, frontend, ui",
    featured: false
  },
  {
    id: 6,
    name: "Liam Davis",
    imageUrl: "https://randomuser.me/api/portraits/men/42.jpg",
    title: "Data Scientist",
    bio: "Analyzes complex datasets using Python and machine learning to extract meaningful insights.",
    profileUrl: "/profile/6",
    keywords: "python, data science, machine learning, tensorflow",
    featured: false
  },
  {
    id: 7,
    name: "Olivia Martinez",
    imageUrl: "https://randomuser.me/api/portraits/women/56.jpg",
    title: "Backend Developer",
    bio: "Specializes in building robust backend systems using Java and Spring framework.",
    profileUrl: "/profile/7",
    keywords: "java, spring, backend, api",
    featured: false
  },
  {
    id: 8,
    name: "Noah Smith",
    imageUrl: "https://randomuser.me/api/portraits/men/17.jpg",
    title: "UX Designer",
    bio: "Creates user-centered designs and prototypes using Figma and other design tools.",
    profileUrl: "/profile/8",
    keywords: "ux, design, figma, user research",
    featured: false
  },
  {
    id: 9,
    name: "Ava Wilson",
    imageUrl: "https://randomuser.me/api/portraits/women/22.jpg",
    title: "Mobile Developer",
    bio: "Builds elegant mobile applications for Apple devices using Swift and UIKit.",
    profileUrl: "/profile/9",
    keywords: "mobile, ios, swift, android",
    featured: false
  },
  {
    id: 10,
    name: "Mason Taylor",
    imageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    title: "DevOps Engineer",
    bio: "Automates CI/CD pipelines and manages cloud infrastructure for optimal deployment.",
    profileUrl: "/profile/10",
    keywords: "devops, aws, ci/cd, docker, kubernetes",
    featured: false
  },
  {
    id: 11,
    name: "Isabella Thomas",
    imageUrl: "https://randomuser.me/api/portraits/women/43.jpg",
    title: "Security Analyst",
    bio: "Protects systems and data through security audits, penetration testing, and best practices.",
    profileUrl: "/profile/11",
    keywords: "cybersecurity, penetration testing, security, encryption",
    featured: false
  },
  {
    id: 12,
    name: "Ethan Brown",
    imageUrl: "https://randomuser.me/api/portraits/men/54.jpg",
    title: "Blockchain Developer",
    bio: "Develops decentralized applications and smart contracts on Ethereum and other platforms.",
    profileUrl: "/profile/12",
    keywords: "blockchain, ethereum, solidity, web3, smart contracts",
    featured: false
  },
  {
    id: 13,
    name: "Mia Harris",
    imageUrl: "https://randomuser.me/api/portraits/women/65.jpg",
    title: "Game Developer",
    bio: "Creates interactive gaming experiences using Unity, C#, and modern game design principles.",
    profileUrl: "/profile/13",
    keywords: "unity, c#, game design, 3d modeling, physics",
    featured: false
  },
  {
    id: 14,
    name: "Jacob Martin",
    imageUrl: "https://randomuser.me/api/portraits/men/76.jpg",
    title: "AR/VR Developer",
    bio: "Builds immersive augmented and virtual reality applications for training and entertainment.",
    profileUrl: "/profile/14",
    keywords: "ar, vr, unity, 3d, animation",
    featured: false
  },
  {
    id: 15,
    name: "Charlotte Garcia",
    imageUrl: "https://randomuser.me/api/portraits/women/87.jpg",
    title: "Product Manager",
    bio: "Leads product development through user research, prototyping, and agile methodologies.",
    profileUrl: "/profile/15",
    keywords: "product management, agile, scrum, user stories, roadmap",
    featured: false
  }
];

// Generate additional profiles for testing
function generateAdditionalProfiles(baseProfiles, count) {
  const additionalProfiles = [];
  const firstNames = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen"];
  const lastNames = ["Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson"];
  
  for (let i = 0; i < count; i++) {
    const baseIndex = i % baseProfiles.length;
    const baseProfile = baseProfiles[baseIndex];
    
    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const gender = Math.random() > 0.5 ? 'men' : 'women';
    const photoId = Math.floor(Math.random() * 99);
    
    additionalProfiles.push({
      id: baseProfiles.length + i + 1,
      name: `${randomFirstName} ${randomLastName}`,
      imageUrl: `https://randomuser.me/api/portraits/${gender}/${photoId}.jpg`,
      title: baseProfile.title,
      bio: baseProfile.bio,
      profileUrl: `/profile/${baseProfiles.length + i + 1}`,
      keywords: baseProfile.keywords,
      featured: false
    });
  }
  
  return additionalProfiles;
}

// Add additional profiles for testing with larger datasets
const additionalProfiles = generateAdditionalProfiles(profiles, 85);
const allProfiles = [...profiles, ...additionalProfiles];

module.exports = allProfiles; 