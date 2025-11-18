import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean up existing data
  console.log('🧹 Cleaning up existing data...');
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.xpTransaction.deleteMany();
  await prisma.streak.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.exerciseAttempt.deleteMany();
  await prisma.spacedRepetitionQueue.deleteMany();
  await prisma.progressSnapshot.deleteMany();
  await prisma.exercisePrompt.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.lessonSection.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.courseEnrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.leaderboard.deleteMany();
  await prisma.preferences.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.language.deleteMany();

  // Seed Languages
  console.log('📝 Seeding languages...');
  const languages = await Promise.all([
    prisma.language.create({
      data: {
        code: 'en',
        name: 'English',
        flag: '🇺🇸',
        isRtl: false,
      },
    }),
    prisma.language.create({
      data: {
        code: 'es',
        name: 'Spanish',
        flag: '🇪🇸',
        isRtl: false,
      },
    }),
    prisma.language.create({
      data: {
        code: 'fr',
        name: 'French',
        flag: '🇫🇷',
        isRtl: false,
      },
    }),
    prisma.language.create({
      data: {
        code: 'de',
        name: 'German',
        flag: '🇩🇪',
        isRtl: false,
      },
    }),
    prisma.language.create({
      data: {
        code: 'it',
        name: 'Italian',
        flag: '🇮🇹',
        isRtl: false,
      },
    }),
    prisma.language.create({
      data: {
        code: 'pt',
        name: 'Portuguese',
        flag: '🇵🇹',
        isRtl: false,
      },
    }),
    prisma.language.create({
      data: {
        code: 'ar',
        name: 'Arabic',
        flag: '🇸🇦',
        isRtl: true,
      },
    }),
    prisma.language.create({
      data: {
        code: 'ja',
        name: 'Japanese',
        flag: '🇯🇵',
        isRtl: false,
      },
    }),
    prisma.language.create({
      data: {
        code: 'ko',
        name: 'Korean',
        flag: '🇰🇷',
        isRtl: false,
      },
    }),
    prisma.language.create({
      data: {
        code: 'zh',
        name: 'Chinese',
        flag: '🇨🇳',
        isRtl: false,
      },
    }),
  ]);

  console.log(`✅ Created ${languages.length} languages`);

  // Seed Demo User
  console.log('👤 Creating demo user...');
  const hashedPassword = await bcrypt.hash('demo123', 10);
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      username: 'demo_user',
      password: hashedPassword,
      role: 'learner',
      profile: {
        create: {
          firstName: 'Demo',
          lastName: 'User',
          bio: 'A demo user for testing the language learning platform',
          timezone: 'UTC',
          language: 'en',
        },
      },
      preferences: {
        create: {
          dailyGoalMinutes: 30,
          emailNotifications: true,
          pushNotifications: true,
          soundEnabled: true,
          vibrationEnabled: true,
          darkMode: false,
          autoPlayAudio: true,
          showTranslations: true,
          difficultyLevel: 'intermediate',
          reminderTime: '19:00',
          weeklyReportDay: 1,
        },
      },
      streak: {
        create: {
          current: 3,
          longest: 7,
          lastActive: new Date(),
        },
      },
    },
  });

  console.log(`✅ Created demo user: ${demoUser.username}`);

  console.log('👑 Creating admin user...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      username: 'admin_user',
      password: adminPassword,
      role: 'admin',
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
          bio: 'Platform administrator',
          timezone: 'UTC',
          language: 'en',
        },
      },
      preferences: {
        create: {
          dailyGoalMinutes: 30,
          emailNotifications: true,
          pushNotifications: true,
          soundEnabled: true,
          vibrationEnabled: true,
          darkMode: false,
          autoPlayAudio: true,
          showTranslations: true,
          difficultyLevel: 'advanced',
          reminderTime: '19:00',
          weeklyReportDay: 1,
        },
      },
    },
  });

  console.log(`✅ Created admin user: ${adminUser.username}`);

  // Seed Sample Course (Spanish for English Speakers)
  console.log('📚 Creating sample course...');
  const spanishLanguage = languages.find(lang => lang.code === 'es')!;
  const sampleCourse = await prisma.course.create({
    data: {
      languageId: spanishLanguage.id,
      title: 'Spanish for Beginners',
      description: 'Learn the basics of Spanish with interactive lessons and exercises.',
      level: 'beginner',
      imageUrl: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=800&h=400&fit=crop',
      isPublished: true,
      sortOrder: 1,
    },
  });

  // Seed Modules
  console.log('📖 Creating course modules...');
  const modules = await Promise.all([
    prisma.module.create({
      data: {
        courseId: sampleCourse.id,
        title: 'Basic Greetings',
        description: 'Learn essential Spanish greetings and introductions',
        sortOrder: 1,
        isPublished: true,
      },
    }),
    prisma.module.create({
      data: {
        courseId: sampleCourse.id,
        title: 'Numbers and Time',
        description: 'Master Spanish numbers and how to tell time',
        sortOrder: 2,
        isPublished: true,
      },
    }),
    prisma.module.create({
      data: {
        courseId: sampleCourse.id,
        title: 'Family and Friends',
        description: 'Learn vocabulary for family members and relationships',
        sortOrder: 3,
        isPublished: true,
      },
    }),
  ]);

  console.log(`✅ Created ${modules.length} modules`);

  // Seed Sample Lessons
  console.log('📝 Creating sample lessons...');
  const lessons = await Promise.all([
    // Module 1: Basic Greetings
    prisma.lesson.create({
      data: {
        moduleId: modules[0].id,
        title: 'Hello and Goodbye',
        description: 'Learn basic Spanish greetings',
        type: 'vocabulary',
        sortOrder: 1,
        isPublished: true,
      },
    }),
    prisma.lesson.create({
      data: {
        moduleId: modules[0].id,
        title: 'Introducing Yourself',
        description: 'How to introduce yourself in Spanish',
        type: 'speaking',
        sortOrder: 2,
        isPublished: true,
      },
    }),
    // Module 2: Numbers and Time
    prisma.lesson.create({
      data: {
        moduleId: modules[1].id,
        title: 'Numbers 1-10',
        description: 'Learn to count from 1 to 10 in Spanish',
        type: 'vocabulary',
        sortOrder: 1,
        isPublished: true,
      },
    }),
    prisma.lesson.create({
      data: {
        moduleId: modules[1].id,
        title: 'Telling Time',
        description: 'Learn how to ask and tell time in Spanish',
        type: 'grammar',
        sortOrder: 2,
        isPublished: true,
      },
    }),
  ]);

  console.log(`✅ Created ${lessons.length} lessons`);

  // Seed Lesson Sections
  console.log('📄 Creating lesson sections...');
  const lessonSections = await Promise.all([
    // Lesson 1: Hello and Goodbye
    prisma.lessonSection.create({
      data: {
        lessonId: lessons[0].id,
        title: 'Basic Greetings',
        content: {
          type: 'text',
          content: 'In Spanish, there are several ways to say hello:\n\n• **Hola** - Hello (informal)\n• **Buenos días** - Good morning\n• **Buenas tardes** - Good afternoon\n• **Buenas noches** - Good evening/night\n\nAnd for goodbye:\n\n• **Adiós** - Goodbye\n• **Hasta luego** - See you later\n• **Hasta mañana** - See you tomorrow',
        },
        type: 'text',
        order: 1,
      },
    }),
    prisma.lessonSection.create({
      data: {
        lessonId: lessons[0].id,
        title: 'Practice Pronunciation',
        content: {
          type: 'audio',
          content: 'Listen to the pronunciation of these greetings and repeat them aloud.',
          audioUrl: '/audio/greetings-pronunciation.mp3',
        },
        type: 'audio',
        order: 2,
      },
    }),
    // Lesson 2: Numbers 1-10
    prisma.lessonSection.create({
      data: {
        lessonId: lessons[2].id,
        title: 'Counting in Spanish',
        content: {
          type: 'text',
          content: 'Here are the numbers 1-10 in Spanish:\n\n• **Uno** - One\n• **Dos** - Two\n• **Tres** - Three\n• **Cuatro** - Four\n• **Cinco** - Five\n• **Seis** - Six\n• **Siete** - Seven\n• **Ocho** - Eight\n• **Nueve** - Nine\n• **Diez** - Ten',
        },
        type: 'text',
        order: 1,
      },
    }),
  ]);

  console.log(`✅ Created ${lessonSections.length} lesson sections`);

  // Seed Sample Exercises
  console.log('🎯 Creating sample exercises...');
  const exercises = await Promise.all([
    // Exercise for Lesson 1: Hello and Goodbye
    prisma.exercise.create({
      data: {
        lessonId: lessons[0].id,
        type: 'multiple_choice',
        question: {
          question: 'How do you say "Hello" in Spanish?',
          options: ['Hola', 'Adiós', 'Gracias', 'Por favor'],
          correctAnswer: 0,
        },
        answer: {
          correctAnswer: 'Hola',
          explanation: 'Hola is the most common way to say hello in Spanish.',
        },
        difficulty: 'easy',
        points: 10,
        sortOrder: 1,
      },
    }),
    prisma.exercise.create({
      data: {
        lessonId: lessons[0].id,
        type: 'translation',
        question: {
          question: 'Translate "Good morning" to Spanish',
          hint: 'Think about the time of day',
        },
        answer: {
          correctAnswer: 'Buenos días',
          alternatives: ['buenos dias', 'Buenos dias'],
          explanation: 'Buenos días literally means "good days" and is used in the morning.',
        },
        difficulty: 'easy',
        points: 15,
        sortOrder: 2,
      },
    }),
    // Exercise for Lesson 2: Numbers 1-10
    prisma.exercise.create({
      data: {
        lessonId: lessons[2].id,
        type: 'fill_blank',
        question: {
          question: 'Complete the sequence: Uno, Dos, ____, Cuatro',
          hint: 'What comes after two?',
        },
        answer: {
          correctAnswer: 'Tres',
          alternatives: ['tres'],
          explanation: 'Tres is the Spanish word for three.',
        },
        difficulty: 'easy',
        points: 10,
        sortOrder: 1,
      },
    }),
    prisma.exercise.create({
      data: {
        lessonId: lessons[2].id,
        type: 'multiple_choice',
        question: {
          question: 'What number is "Siete" in English?',
          options: ['Five', 'Six', 'Seven', 'Eight'],
          correctAnswer: 2,
        },
        answer: {
          correctAnswer: 'Seven',
          explanation: 'Siete is the Spanish word for seven.',
        },
        difficulty: 'easy',
        points: 10,
        sortOrder: 2,
      },
    }),
  ]);

  console.log(`✅ Created ${exercises.length} exercises`);

  // Seed Exercise Prompts
  console.log('💬 Creating exercise prompts...');
  const exercisePrompts = await Promise.all([
    // Audio prompts for speaking exercises
    prisma.exercisePrompt.create({
      data: {
        exerciseId: exercises[1].id,
        prompt: 'Listen and repeat: Buenos días',
        type: 'audio',
        data: {
          audioUrl: '/audio/buenos-dias.mp3',
          transcript: 'Buenos días',
        },
      },
    }),
    // Image prompts for visual exercises
    prisma.exercisePrompt.create({
      data: {
        exerciseId: exercises[2].id,
        prompt: 'What number is shown in the image?',
        type: 'image',
        data: {
          imageUrl: '/images/number-three.png',
          alt: 'The number 3',
        },
      },
    }),
  ]);

  console.log(`✅ Created ${exercisePrompts.length} exercise prompts`);

  // Seed Achievements
  console.log('🏆 Creating achievements...');
  const achievements = await Promise.all([
    prisma.achievement.create({
      data: {
        name: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🎓',
        badgeColor: '#10b981',
        xpReward: 50,
        condition: {
          type: 'lesson_completed',
          count: 1,
        },
        sortOrder: 1,
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        badgeColor: '#ef4444',
        xpReward: 100,
        condition: {
          type: 'streak',
          value: 7,
        },
        sortOrder: 2,
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Social Butterfly',
        description: 'Make 5 friends',
        icon: '🦋',
        badgeColor: '#8b5cf6',
        xpReward: 75,
        condition: {
          type: 'friends',
          count: 5,
        },
        sortOrder: 3,
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'XP Champion',
        description: 'Earn 1000 total XP',
        icon: '⭐',
        badgeColor: '#f59e0b',
        xpReward: 200,
        condition: {
          type: 'total_xp',
          value: 1000,
        },
        sortOrder: 4,
      },
    }),
  ]);

  console.log(`✅ Created ${achievements.length} achievements`);

  // Seed Leaderboards
  console.log('🏅 Creating leaderboards...');
  const leaderboards = await Promise.all([
    prisma.leaderboard.create({
      data: {
        name: 'Weekly XP Leaders',
        description: 'Top XP earners this week',
        type: 'weekly',
        resetPeriod: 'weekly',
      },
    }),
    prisma.leaderboard.create({
      data: {
        name: 'All-Time Champions',
        description: 'Highest XP of all time',
        type: 'all_time',
      },
    }),
    prisma.leaderboard.create({
      data: {
        name: 'Spanish Course Leaders',
        description: 'Top learners in Spanish course',
        type: 'course_specific',
        courseId: sampleCourse.id,
      },
    }),
  ]);

  console.log(`✅ Created ${leaderboards.length} leaderboards`);

  // Create some sample XP transactions for demo user
  console.log('💰 Creating sample XP transactions...');
  await Promise.all([
    prisma.xpTransaction.create({
      data: {
        userId: demoUser.id,
        amount: 50,
        reason: 'lesson_completed',
        sourceId: lessons[0].id,
        sourceType: 'lesson',
      },
    }),
    prisma.xpTransaction.create({
      data: {
        userId: demoUser.id,
        amount: 25,
        reason: 'exercise_completed',
        sourceId: exercises[0].id,
        sourceType: 'exercise',
      },
    }),
    prisma.xpTransaction.create({
      data: {
        userId: demoUser.id,
        amount: 30,
        reason: 'streak_bonus',
      },
    }),
  ]);

  // Create some progress snapshots
  console.log('📊 Creating sample progress snapshots...');
  await Promise.all([
    prisma.progressSnapshot.create({
      data: {
        userId: demoUser.id,
        courseId: sampleCourse.id,
        lessonId: lessons[0].id,
        completedAt: new Date(Date.now() - 86400000), // yesterday
        timeSpent: 300, // 5 minutes
        score: 85,
        xpEarned: 25,
      },
    }),
    prisma.progressSnapshot.create({
      data: {
        userId: demoUser.id,
        courseId: sampleCourse.id,
        lessonId: lessons[2].id,
        completedAt: new Date(),
        timeSpent: 420, // 7 minutes
        score: 92,
        xpEarned: 35,
      },
    }),
  ]);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`  • Languages: ${languages.length}`);
  console.log(`  • Courses: 1`);
  console.log(`  • Modules: ${modules.length}`);
  console.log(`  • Lessons: ${lessons.length}`);
  console.log(`  • Exercises: ${exercises.length}`);
  console.log(`  • Achievements: ${achievements.length}`);
  console.log(`  • Leaderboards: ${leaderboards.length}`);
  console.log(`  • Demo User: demo@example.com (password: demo123)`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });