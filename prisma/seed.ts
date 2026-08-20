import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const RESERVED_USERNAMES = [
  { username: 'admin', reason: 'Platform administration' },
  { username: 'administrator', reason: 'Platform administration' },
  { username: 'api', reason: 'System API endpoints' },
  { username: 'app', reason: 'Core application' },
  { username: 'dashboard', reason: 'User dashboard' },
  { username: 'login', reason: 'Authentication entry' },
  { username: 'signup', reason: 'Authentication entry' },
  { username: 'auth', reason: 'Authentication endpoint' },
  { username: 'oauth', reason: 'OAuth redirect' },
  { username: 'support', reason: 'Support team' },
  { username: 'help', reason: 'Help center' },
  { username: 'docs', reason: 'Documentation' },
  { username: 'status', reason: 'System status' },
  { username: 'mail', reason: 'Mail service' },
  { username: 'email', reason: 'Mail service' },
  { username: 'www', reason: 'World wide web prefix' },
  { username: 'cdn', reason: 'Content delivery network' },
  { username: 'assets', reason: 'Static assets' },
  { username: 'static', reason: 'Static assets' },
  { username: 'folio', reason: 'Platform name' },
  { username: 'dev', reason: 'Development environment' },
  { username: 'staging', reason: 'Staging environment' },
  { username: 'test', reason: 'Testing' },
  { username: 'demo', reason: 'Demonstration' },
  { username: 'preview', reason: 'Preview mode' },
  { username: 'explore', reason: 'Discovery portal' },
  { username: 'directory', reason: 'User directory' },
];

async function main() {
  console.log('Seeding reserved usernames...');
  for (const item of RESERVED_USERNAMES) {
    await prisma.reservedUsername.upsert({
      where: { username: item.username },
      update: {},
      create: {
        username: item.username,
        reason: item.reason,
      },
    });
  }

  // Create demo user: Alex Rivera
  const demoEmail = 'alex@example.com';
  const existingUser = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  if (!existingUser) {
    console.log('Creating demo user: alex@example.com');
    await prisma.user.create({
      data: {
        email: demoEmail,
        name: 'Alex Rivera',
        role: 'ADMIN',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        website: {
          create: {
            username: 'alex',
            templateId: 'minimal',
            published: true,
            profile: {
              create: {
                headline: 'Full-Stack Software Engineer & Open Source Contributor',
                bio: 'Passionate software engineer building systems at the intersection of modern web performance, cloud infrastructure, and user experience.',
                location: 'San Francisco, CA',
                avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
                resumeUrl: 'https://example.com/resume.pdf',
              },
            },
            projects: {
              create: [
                {
                  title: 'AI Workflow Engine',
                  description: 'An AI-powered workflow automation system for developers and data engineers.',
                  liveUrl: 'https://github.com/example/ai-workflow',
                  sourceUrl: 'https://github.com/example/ai-workflow',
                  tags: 'Next.js, TypeScript, AI, Vector DB',
                  order: 0,
                },
                {
                  title: 'Distributed Key-Value Store',
                  description: 'High-throughput Raft-consensus based distributed key-value store with sub-millisecond replication latency.',
                  liveUrl: 'https://github.com/example/raft-kv',
                  sourceUrl: 'https://github.com/example/raft-kv',
                  tags: 'Go, Raft, gRPC, Distributed Systems',
                  order: 1,
                },
                {
                  title: 'Real-time Portfolio Platform',
                  description: 'High-speed portfolio platform with modern design templates and instant sub-domain routing.',
                  liveUrl: 'https://example.com',
                  sourceUrl: 'https://github.com/example/portfolio-platform',
                  tags: 'Next.js 15, React, Tailwind / CSS Modules',
                  order: 2,
                },
              ],
            },
            experiences: {
              create: [
                {
                  company: 'Acme Corp',
                  role: 'Senior Software Engineer',
                  description: 'Engineered high-throughput cloud microservices and developer tooling.',
                  startDate: 'May 2023',
                  endDate: 'Present',
                  current: true,
                  order: 0,
                },
                {
                  company: 'Open Source Initiative',
                  role: 'Core Maintainer',
                  description: 'Maintained popular open source libraries and contributed to developer tooling ecosystem.',
                  startDate: 'Aug 2021',
                  endDate: 'May 2023',
                  current: false,
                  order: 1,
                },
              ],
            },
            educations: {
              create: [
                {
                  institution: 'Institute of Technology',
                  degree: 'Bachelor of Science (B.S.)',
                  field: 'Computer Science',
                  startDate: '2019',
                  endDate: '2023',
                  current: false,
                  gpa: '3.9 / 4.0',
                  order: 0,
                },
              ],
            },
            skills: {
              create: [
                { name: 'TypeScript', category: 'Languages', order: 0 },
                { name: 'Go', category: 'Languages', order: 1 },
                { name: 'Python', category: 'Languages', order: 2 },
                { name: 'Next.js', category: 'Frameworks', order: 3 },
                { name: 'React', category: 'Frameworks', order: 4 },
                { name: 'Node.js', category: 'Frameworks', order: 5 },
                { name: 'PostgreSQL', category: 'Databases', order: 6 },
                { name: 'Redis', category: 'Databases', order: 7 },
                { name: 'Docker', category: 'DevOps', order: 8 },
                { name: 'Kubernetes', category: 'DevOps', order: 9 },
              ],
            },
            socialLinks: {
              create: [
                { platform: 'github', url: 'https://github.com', order: 0 },
                { platform: 'linkedin', url: 'https://linkedin.com', order: 1 },
                { platform: 'twitter', url: 'https://x.com', order: 2 },
                { platform: 'mail', url: 'mailto:alex@example.com', order: 3 },
              ],
            },
          },
        },
      },
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
