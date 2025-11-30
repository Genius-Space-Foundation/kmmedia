
export interface SuccessStory {
  id: number;
  name: string;
  role: string;
  company: string;
  course: string;
  image: string;
  story: string;
  fullStory: string[];
  achievement: string;
  beforeRole: string;
  afterRole: string;
  salary: string;
  year: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
}

export const successStories: SuccessStory[] = [
  {
    id: 1,
    name: "Chris",
    role: "Digital Marketing Manager",
    company: "TechStart Nigeria",
    course: "Digital Marketing Mastery",
    image: "👩‍💼",
    story:
      "After completing the Digital Marketing Mastery course, I was able to secure a senior role at one of Nigeria's leading tech startups. The practical skills I learned, especially in SEO and social media marketing, directly contributed to increasing our company's online presence by 300%.",
    fullStory: [
      "My journey into digital marketing began with a curiosity about how brands connect with audiences online. Before joining KM Media Training Institute, I was working as a Junior Marketing Assistant, but I felt limited by my lack of technical skills. I knew that to advance in my career, I needed to master the tools and strategies that drive modern marketing.",
      "The Digital Marketing Mastery course was a game-changer. It wasn't just theory; we worked on live projects, analyzed real data, and created comprehensive campaigns. I learned the intricacies of SEO, the power of content marketing, and how to leverage social media analytics to make data-driven decisions. The instructors were industry veterans who shared insights you can't find in textbooks.",
      "Upon graduating, I felt confident enough to apply for senior roles. I landed a position at TechStart Nigeria, where I was tasked with revamping their digital strategy. Using the frameworks I learned at the institute, I led a campaign that increased our online presence by 300% in just six months. Today, I lead a team of five and continue to apply the lessons I learned at KM Media every day.",
    ],
    achievement: "300% increase in company's online presence",
    beforeRole: "Junior Marketing Assistant",
    afterRole: "Digital Marketing Manager",
    salary: "Salary increased by 180%",
    year: "2024",
  },
  {
    id: 2,
    name: "Chris",
    role: "Video Content Creator",
    company: "Freelance & Nollywood",
    course: "Video Production & Editing",
    image: "👨‍🎬",
    story:
      "The Video Production course transformed my passion into a profitable career. I went from knowing nothing about video editing to working on major Nollywood productions. The hands-on training and industry connections made all the difference.",
    fullStory: [
      "I always had a passion for storytelling, but I didn't know how to translate that into visual media. I was an unemployed graduate, dabbling in photography but struggling to make a living. I realized that video was the future, and I needed professional training to compete in the industry.",
      "Enrolling in the Video Production & Editing course at KM Media Training Institute was the best decision I ever made. The curriculum covered everything from camera operation and lighting to advanced post-production techniques. We had access to state-of-the-art equipment, and the hands-on projects allowed me to build a professional portfolio while still studying.",
      "The institute's industry connections were invaluable. Through a networking event organized by the school, I met a director who offered me my first gig on a Nollywood set. Since then, I've worked on over 15 productions, including some blockbusters. I now run my own freelance business, earning over ₵500k monthly, and I attribute my success entirely to the solid foundation I received at KM Media.",
    ],
    achievement: "Worked on 15+ Nollywood productions",
    beforeRole: "Unemployed Graduate",
    afterRole: "Professional Video Producer",
    salary: "Earning ₵500k+ monthly",
    year: "2023",
  },
  {
    id: 3,
    name: "Chris",
    role: "Broadcast Journalist",
    company: "Channels Television",
    course: "Broadcast Journalism",
    image: "👩‍📺",
    story:
      "KM Media Training Institute didn't just teach me journalism; they prepared me for the real world. The practical sessions, including live news presentation practice, gave me the confidence to excel in my role at Channels TV.",
    fullStory: [
      "Growing up, I always admired the news anchors on TV, but the path to becoming one seemed daunting. As a fresh graduate, I had the theoretical knowledge but lacked the practical skills and confidence required for broadcast journalism. I needed a bridge between university and the professional world.",
      "KM Media Training Institute provided that bridge. The Broadcast Journalism course was intense and immersive. We spent hours in the studio, practicing news presentation, conducting mock interviews, and learning how to operate teleprompters. The feedback from instructors was direct and constructive, helping me refine my voice and on-camera presence.",
      "The highlight of my training was the internship placement program. I was placed at a local radio station, which eventually led to an opportunity at Channels Television. My supervisors were impressed by how 'camera-ready' I was from day one. Within a year, I became the youngest prime-time anchor at the station, a dream come true that wouldn't have been possible without the rigorous training at KM Media.",
    ],
    achievement: "Became youngest prime-time anchor",
    beforeRole: "Fresh Graduate",
    afterRole: "News Anchor",
    salary: "Landed dream job at top TV station",
    year: "2024",
  },
  {
    id: 4,
    name: "Chris",
    role: "Brand Designer",
    company: "Okafor Creative Studio",
    course: "Graphic Design & Branding",
    image: "👨‍🎨",
    story:
      "Starting my own design studio was always a dream, but I lacked the technical skills and business knowledge. The Graphic Design course not only taught me advanced design techniques but also how to run a creative business.",
    fullStory: [
      "I was working as a part-time designer, creating flyers for small businesses, but I knew my work lacked a professional polish. I wanted to work with bigger brands and charge premium rates, but my portfolio wasn't strong enough. I enrolled in the Graphic Design & Branding course to elevate my craft.",
      "The course went far beyond just teaching software like Photoshop and Illustrator. It delved into design theory, color psychology, and brand strategy. We learned how to think like creative directors, not just technicians. One of the most valuable modules was on the business of design, which taught me about pricing, contracts, and client management.",
      "Armed with a killer portfolio and business acumen, I launched Okafor Creative Studio shortly after graduating. The transformation was immediate. I started attracting high-ticket clients and was able to scale my business rapidly. Today, my studio generates over ₵2M monthly, and I have a team of three designers working under me. KM Media gave me the tools to turn my side hustle into a thriving enterprise.",
    ],
    achievement: "Founded successful design studio",
    beforeRole: "Part-time Designer",
    afterRole: "Studio Owner & Creative Director",
    salary: "Business generating ₵2M+ monthly",
    year: "2023",
  },
  {
    id: 5,
    name: "Chris",
    role: "Podcast Host & Producer",
    company: "The Aisha Show",
    course: "Podcast Production",
    image: "👩‍🎙️",
    story:
      "My podcast now reaches over 50,000 listeners across Africa. The technical skills and marketing strategies I learned have been invaluable in growing my audience and securing major brand sponsorships.",
    fullStory: [
      "I was stuck in a corporate job that drained me, and I used to listen to podcasts as an escape. I had so many ideas for my own show but had no clue where to start. I didn't know about microphones, editing software, or hosting platforms. I joined the Podcast Production course to find my voice.",
      "The course demystified the entire process. We learned about audio engineering, storytelling, and interview techniques. But what really set it apart was the focus on growth and monetization. We learned how to market our podcasts, engage with listeners, and pitch to sponsors. It turned a hobby into a viable business model.",
      "I launched 'The Aisha Show' as my final project. The initial traction was slow, but I applied the marketing strategies I learned consistently. Within a year, I hit 50,000 listeners. I've since quit my corporate job to podcast full-time, securing sponsorships from major brands. I'm living my dream, sharing stories that matter, all thanks to the guidance I received.",
    ],
    achievement: "50k+ podcast listeners",
    beforeRole: "Corporate Employee",
    afterRole: "Full-time Podcaster",
    salary: "Multiple brand sponsorships",
    year: "2024",
  },
  {
    id: 6,
    name: "Chris",
    role: "Social Media Strategist",
    company: "Dangote Group",
    course: "Social Media Management",
    image: "👨‍💻",
    story:
      "The Social Media Management course equipped me with cutting-edge strategies that helped me land a role at one of Africa's largest conglomerates. I now manage social media for multiple Dangote brands.",
    fullStory: [
      "I started as a Social Media Assistant, mostly just posting content that others created. I wanted to be the one driving the strategy, but I lacked the strategic framework. I saw the Social Media Management course at KM Media as my ticket to the big leagues.",
      "The course was intense and up-to-the-minute. We studied current trends, algorithm changes, and crisis management. We learned how to build comprehensive social media strategies that align with business goals. The capstone project involved creating a full strategy for a real brand, which was an incredible learning experience.",
      "I used my capstone project in my portfolio when applying for a role at the Dangote Group. The hiring manager was impressed by the depth of my strategic thinking. I was hired as a Senior Social Media Strategist, a significant jump from my previous role. In just 18 months, I've been promoted twice and now oversee the digital presence for several key brands within the group.I started as a Social Media Assistant, mostly just posting content that others created. I wanted to be the one driving the strategy, but I lacked the strategic framework. I saw the Social Media Management course at KM Media as my ticket to the big leagues.",
      "The course was intense and up-to-the-minute. We studied current trends, algorithm changes, and crisis management. We learned how to build comprehensive social media strategies that align with business goals. The capstone project involved creating a full strategy for a real brand, which was an incredible learning experience.",
      "I used my capstone project in my portfolio when applying for a role at the Dangote Group. The hiring manager was impressed by the depth of my strategic thinking. I was hired as a Senior Social Media Strategist, a significant jump from my previous role. In just 18 months, I've been promoted twice and now oversee the digital presence for several key brands within the group.",
    ],
    achievement: "Manages 5+ major brand accounts",
    beforeRole: "Social Media Assistant",
    afterRole: "Senior Social Media Strategist",
    salary: "Promoted twice in 18 months",
    year: "2023",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Chris",
    role: "Alumni, Class of 2023",
    content:
      "The instructors are industry professionals who bring real-world experience to the classroom. The hybrid learning model allowed me to balance work while gaining new skills.",
    rating: 5,
  },
  {
    id: 2,
    name: "Chris",
    role: "Alumni, Class of 2024",
    content:
      "Best investment I've made in my career. The practical approach and industry connections opened doors I never thought possible.",
    rating: 5,
  },
  {
    id: 3,
    name: "Chris",
    role: "Alumni, Class of 2023",
    content:
      "The support doesn't end after graduation. The career services team helped me land my dream job, and the alumni network is incredibly strong.",
    rating: 5,
  },
];
