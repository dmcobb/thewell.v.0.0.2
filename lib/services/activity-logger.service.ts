import { apiClient } from '../api-client';
import { API_ENDPOINTS } from '../constants';

interface ActivityData {
  user_id: string;
  content_type: string;
  moderation_data?: Record<string, unknown>;
}

interface ActivityLogResponse {
  success: boolean;
  message: string;
  data?: { log_id: string };
}

class ActivityLoggerService {
  /**
   * Log user like activity
   */
  async logLike(userId: string, targetUserId: string): Promise<void> {
    try {
      await apiClient.post<ActivityLogResponse>(
        API_ENDPOINTS.MODERATION.LOG_ACTIVITY,
        {
          user_id: userId,
          content_type: 'like',
          moderation_data: {
            target_user_id: targetUserId,
            action: 'like',
            timestamp: new Date().toISOString(),
          },
        }
      );
    } catch (error) {
      console.error('[Activity Logger] Failed to log like:', error);
      // Silently fail - don't interrupt user experience
    }
  }

  /**
   * Log user match activity
   */
  async logMatch(userId: string, matchId: string, targetUserId: string): Promise<void> {
    try {
      await apiClient.post<ActivityLogResponse>(
        API_ENDPOINTS.MODERATION.LOG_ACTIVITY,
        {
          user_id: userId,
          content_type: 'match',
          moderation_data: {
            match_id: matchId,
            target_user_id: targetUserId,
            action: 'match',
            timestamp: new Date().toISOString(),
          },
        }
      );
    } catch (error) {
      console.error('[Activity Logger] Failed to log match:', error);
    }
  }

  /**
   * Log user message activity
   */
  async logMessage(
    userId: string,
    conversationId: string,
    messageContent: string
  ): Promise<void> {
    try {
      await apiClient.post<ActivityLogResponse>(
        API_ENDPOINTS.MODERATION.LOG_ACTIVITY,
        {
          user_id: userId,
          content_type: 'message',
          moderation_data: {
            conversation_id: conversationId,
            message_length: messageContent.length,
            action: 'send_message',
            timestamp: new Date().toISOString(),
          },
        }
      );
    } catch (error) {
      console.error('[Activity Logger] Failed to log message:', error);
    }
  }

  /**
   * Log profile view activity
   */
  async logProfileView(userId: string, targetUserId: string): Promise<void> {
    try {
      await apiClient.post<ActivityLogResponse>(
        API_ENDPOINTS.MODERATION.LOG_ACTIVITY,
        {
          user_id: userId,
          content_type: 'profile_view',
          moderation_data: {
            target_user_id: targetUserId,
            action: 'view_profile',
            timestamp: new Date().toISOString(),
          },
        }
      );
    } catch (error) {
      console.error('[Activity Logger] Failed to log profile view:', error);
    }
  }

  /**
   * Log user block activity
   */
  async logBlock(userId: string, targetUserId: string, reason?: string): Promise<void> {
    try {
      await apiClient.post<ActivityLogResponse>(
        API_ENDPOINTS.MODERATION.LOG_ACTIVITY,
        {
          user_id: userId,
          content_type: 'block',
          moderation_data: {
            target_user_id: targetUserId,
            reason: reason || 'user_initiated',
            action: 'block_user',
            timestamp: new Date().toISOString(),
          },
        }
      );
    } catch (error) {
      console.error('[Activity Logger] Failed to log block:', error);
    }
  }

  /**
   * Log user report activity
   */
  async logReport(
    userId: string,
    targetUserId: string,
    reason: string,
    description: string
  ): Promise<void> {
    try {
      await apiClient.post<ActivityLogResponse>(
        API_ENDPOINTS.MODERATION.LOG_ACTIVITY,
        {
          user_id: userId,
          content_type: 'report',
          moderation_data: {
            target_user_id: targetUserId,
            reason,
            description,
            action: 'report_user',
            timestamp: new Date().toISOString(),
          },
        }
      );
    } catch (error) {
      console.error('[Activity Logger] Failed to log report:', error);
    }
  }

  /**
   * Log generic activity
   */
  async logActivity(
    userId: string,
    contentType: string,
    data: Record<string, unknown>
  ): Promise<void> {
    try {
      await apiClient.post<ActivityLogResponse>(
        API_ENDPOINTS.MODERATION.LOG_ACTIVITY,
        {
          user_id: userId,
          content_type: contentType,
          moderation_data: {
            ...data,
            timestamp: new Date().toISOString(),
          },
        }
      );
    } catch (error) {
      console.error('[Activity Logger] Failed to log activity:', error);
    }
  }
}

export const activityLoggerService = new ActivityLoggerService();
