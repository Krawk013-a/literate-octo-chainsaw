import { prisma } from '../config/database';
import { AppError } from '../utils/error';
import { Prisma } from '../generated/prisma';

export interface LessonContentResponse {
  id: string;
  title: string;
  description: string | null;
  type: string;
  sections: {
    id: string;
    title: string;
    content: Prisma.JsonValue;
    type: string;
    order: number;
  }[];
  exercises: {
    id: string;
    type: string;
    question: Prisma.JsonValue;
    answer: Prisma.JsonValue;
    hints: Prisma.JsonValue;
    difficulty: string;
    points: number;
    timeLimit: number | null;
    sortOrder: number;
    prompts: {
      id: string;
      prompt: string;
      type: string;
      data: Prisma.JsonValue;
    }[];
  }[];
}

export class ContentService {
  async getLanguages() {
    return await prisma.language.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getLanguageById(id: string) {
    const language = await prisma.language.findUnique({
      where: { id },
    });

    if (!language) {
      throw new AppError(404, 'Language not found');
    }

    return language;
  }

  async createLanguage(data: {
    code: string;
    name: string;
    flag?: string;
    isRtl?: boolean;
  }) {
    return await prisma.language.create({
      data,
    });
  }

  async updateLanguage(
    id: string,
    data: {
      code?: string;
      name?: string;
      flag?: string;
      isRtl?: boolean;
      isActive?: boolean;
    },
  ) {
    return await prisma.language.update({
      where: { id },
      data,
    });
  }

  async deleteLanguage(id: string) {
    await prisma.language.delete({
      where: { id },
    });
  }

  async getCourses(languageId?: string, isPublished?: boolean) {
    return await prisma.course.findMany({
      where: {
        ...(languageId && { languageId }),
        ...(isPublished !== undefined && { isPublished }),
      },
      include: {
        language: true,
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async getCourseById(id: string) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        language: true,
        modules: {
          where: { isPublished: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: {
              where: { isPublished: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!course) {
      throw new AppError(404, 'Course not found');
    }

    return course;
  }

  async createCourse(data: {
    languageId: string;
    title: string;
    description?: string;
    level: string;
    imageUrl?: string;
    sortOrder?: number;
  }) {
    const language = await prisma.language.findUnique({
      where: { id: data.languageId },
    });

    if (!language) {
      throw new AppError(404, 'Language not found');
    }

    return await prisma.course.create({
      data,
      include: {
        language: true,
      },
    });
  }

  async updateCourse(
    id: string,
    data: {
      title?: string;
      description?: string;
      level?: string;
      imageUrl?: string;
      isPublished?: boolean;
      sortOrder?: number;
    },
  ) {
    return await prisma.course.update({
      where: { id },
      data,
      include: {
        language: true,
      },
    });
  }

  async deleteCourse(id: string) {
    await prisma.course.delete({
      where: { id },
    });
  }

  async getModules(courseId: string) {
    return await prisma.module.findMany({
      where: { courseId },
      include: {
        _count: {
          select: { lessons: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getModuleById(id: string) {
    const module = await prisma.module.findUnique({
      where: { id },
      include: {
        course: true,
        lessons: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!module) {
      throw new AppError(404, 'Module not found');
    }

    return module;
  }

  async createModule(data: {
    courseId: string;
    title: string;
    description?: string;
    sortOrder?: number;
  }) {
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
    });

    if (!course) {
      throw new AppError(404, 'Course not found');
    }

    return await prisma.module.create({
      data,
    });
  }

  async updateModule(
    id: string,
    data: {
      title?: string;
      description?: string;
      sortOrder?: number;
      isPublished?: boolean;
    },
  ) {
    return await prisma.module.update({
      where: { id },
      data,
    });
  }

  async deleteModule(id: string) {
    await prisma.module.delete({
      where: { id },
    });
  }

  async getLessons(moduleId: string) {
    return await prisma.lesson.findMany({
      where: { moduleId },
      include: {
        _count: {
          select: {
            sections: true,
            exercises: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getLessonById(id: string) {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: true,
          },
        },
        sections: {
          orderBy: { order: 'asc' },
        },
        exercises: {
          include: {
            prompts: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!lesson) {
      throw new AppError(404, 'Lesson not found');
    }

    return lesson;
  }

  async getLessonContent(lessonId: string): Promise<LessonContentResponse> {
    const lesson = await this.getLessonById(lessonId);

    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      type: lesson.type,
      sections: lesson.sections,
      exercises: lesson.exercises,
    };
  }

  async createLesson(data: {
    moduleId: string;
    title: string;
    description?: string;
    type: string;
    sortOrder?: number;
  }) {
    const module = await prisma.module.findUnique({
      where: { id: data.moduleId },
    });

    if (!module) {
      throw new AppError(404, 'Module not found');
    }

    return await prisma.lesson.create({
      data,
    });
  }

  async updateLesson(
    id: string,
    data: {
      title?: string;
      description?: string;
      type?: string;
      sortOrder?: number;
      isPublished?: boolean;
    },
  ) {
    return await prisma.lesson.update({
      where: { id },
      data,
    });
  }

  async deleteLesson(id: string) {
    await prisma.lesson.delete({
      where: { id },
    });
  }

  async createLessonSection(data: {
    lessonId: string;
    title: string;
    content: Prisma.JsonValue;
    type: string;
    order?: number;
  }) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: data.lessonId },
    });

    if (!lesson) {
      throw new AppError(404, 'Lesson not found');
    }

    return await prisma.lessonSection.create({
      data,
    });
  }

  async updateLessonSection(
    id: string,
    data: {
      title?: string;
      content?: Prisma.JsonValue;
      type?: string;
      order?: number;
    },
  ) {
    return await prisma.lessonSection.update({
      where: { id },
      data,
    });
  }

  async deleteLessonSection(id: string) {
    await prisma.lessonSection.delete({
      where: { id },
    });
  }

  async createExercise(data: {
    lessonId: string;
    type: string;
    question: Prisma.JsonValue;
    answer: Prisma.JsonValue;
    hints?: Prisma.JsonValue;
    difficulty?: string;
    points?: number;
    timeLimit?: number;
    sortOrder?: number;
  }) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: data.lessonId },
    });

    if (!lesson) {
      throw new AppError(404, 'Lesson not found');
    }

    return await prisma.exercise.create({
      data,
    });
  }

  async updateExercise(
    id: string,
    data: {
      type?: string;
      question?: Prisma.JsonValue;
      answer?: Prisma.JsonValue;
      hints?: Prisma.JsonValue;
      difficulty?: string;
      points?: number;
      timeLimit?: number;
      sortOrder?: number;
    },
  ) {
    return await prisma.exercise.update({
      where: { id },
      data,
    });
  }

  async deleteExercise(id: string) {
    await prisma.exercise.delete({
      where: { id },
    });
  }

  async createExercisePrompt(data: {
    exerciseId: string;
    prompt: string;
    type: string;
    data?: Prisma.JsonValue;
  }) {
    const exercise = await prisma.exercise.findUnique({
      where: { id: data.exerciseId },
    });

    if (!exercise) {
      throw new AppError(404, 'Exercise not found');
    }

    return await prisma.exercisePrompt.create({
      data,
    });
  }

  async updateExercisePrompt(
    id: string,
    data: {
      prompt?: string;
      type?: string;
      data?: Prisma.JsonValue;
    },
  ) {
    return await prisma.exercisePrompt.update({
      where: { id },
      data,
    });
  }

  async deleteExercisePrompt(id: string) {
    await prisma.exercisePrompt.delete({
      where: { id },
    });
  }
}

export const contentService = new ContentService();
