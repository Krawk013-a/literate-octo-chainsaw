import { prisma } from '../config/database';
import { AppError } from '../utils/error';

export interface ProfileData {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  timezone?: string;
  language?: string;
}

export interface PreferencesData {
  dailyGoalMinutes?: number;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
  darkMode?: boolean;
  autoPlayAudio?: boolean;
  showTranslations?: boolean;
  difficultyLevel?: string;
  reminderTime?: string;
  weeklyReportDay?: number;
}

class ProfileService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        profile: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: ProfileData) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const profileData: any = {};
    if (data.firstName !== undefined) profileData.firstName = data.firstName;
    if (data.lastName !== undefined) profileData.lastName = data.lastName;
    if (data.avatar !== undefined) profileData.avatar = data.avatar;
    if (data.bio !== undefined) profileData.bio = data.bio;
    if (data.timezone !== undefined) profileData.timezone = data.timezone;
    if (data.language !== undefined) profileData.language = data.language;

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: profileData,
      create: {
        userId,
        ...profileData,
      },
    });

    return profile;
  }

  async getPreferences(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const preferences = await prisma.preferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      throw new AppError(404, 'Preferences not found');
    }

    return preferences;
  }

  async updatePreferences(userId: string, data: PreferencesData) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const preferencesData: any = {};
    if (data.dailyGoalMinutes !== undefined) preferencesData.dailyGoalMinutes = data.dailyGoalMinutes;
    if (data.emailNotifications !== undefined) preferencesData.emailNotifications = data.emailNotifications;
    if (data.pushNotifications !== undefined) preferencesData.pushNotifications = data.pushNotifications;
    if (data.soundEnabled !== undefined) preferencesData.soundEnabled = data.soundEnabled;
    if (data.vibrationEnabled !== undefined) preferencesData.vibrationEnabled = data.vibrationEnabled;
    if (data.darkMode !== undefined) preferencesData.darkMode = data.darkMode;
    if (data.autoPlayAudio !== undefined) preferencesData.autoPlayAudio = data.autoPlayAudio;
    if (data.showTranslations !== undefined) preferencesData.showTranslations = data.showTranslations;
    if (data.difficultyLevel !== undefined) preferencesData.difficultyLevel = data.difficultyLevel;
    if (data.reminderTime !== undefined) preferencesData.reminderTime = data.reminderTime;
    if (data.weeklyReportDay !== undefined) preferencesData.weeklyReportDay = data.weeklyReportDay;

    const preferences = await prisma.preferences.upsert({
      where: { userId },
      update: preferencesData,
      create: {
        userId,
        ...preferencesData,
      },
    });

    return preferences;
  }
}

export const profileService = new ProfileService();
