/**
 * Post Service Client
 * Client-side implementation of post service operations
 */

import type { Post, PostAnalytics } from '@/lib/types/post';
import type { ServiceResult } from '../contracts/types';
import type {
  PostService,
  CreatePostInput,
  UpdatePostInput,
  DeletePostInput,
  GetPostInput,
  ListPostsInput,
  SavePostInput,
  PublishPostInput,
  PublishPostResult,
  DuplicatePostInput,
  GetPostAnalyticsInput,
} from '../contracts/post-service-contract';

class PostServiceClient implements PostService {
  createPost = {
    async execute(input: CreatePostInput): Promise<ServiceResult<Post>> {
      try {
        const response = await fetch('/api/v1/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Failed to create post' }));
          return {
            success: false,
            error: {
              code: 'create_failed',
              message: error.message || 'Failed to create post',
            },
          };
        }

        const data = await response.json();
        return {
          success: true,
          data,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'network_error',
            message: error instanceof Error ? error.message : 'Network error',
          },
        };
      }
    },
  };

  updatePost = {
    async execute(input: UpdatePostInput): Promise<ServiceResult<Post>> {
      try {
        const response = await fetch(`/api/v1/posts/${input.postId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Failed to update post' }));
          return {
            success: false,
            error: {
              code: 'update_failed',
              message: error.message || 'Failed to update post',
            },
          };
        }

        const data = await response.json();
        return {
          success: true,
          data,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'network_error',
            message: error instanceof Error ? error.message : 'Network error',
          },
        };
      }
    },
  };

  deletePost = {
    async execute(input: DeletePostInput): Promise<ServiceResult<void>> {
      try {
        const response = await fetch(`/api/v1/posts/${input.postId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Failed to delete post' }));
          return {
            success: false,
            error: {
              code: 'delete_failed',
              message: error.message || 'Failed to delete post',
            },
          };
        }

        return {
          success: true,
          data: undefined,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'network_error',
            message: error instanceof Error ? error.message : 'Network error',
          },
        };
      }
    },
  };

  getPost = {
    async execute(input: GetPostInput): Promise<ServiceResult<Post>> {
      try {
        const response = await fetch(`/api/v1/posts/${input.postId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Failed to get post' }));
          return {
            success: false,
            error: {
              code: 'get_failed',
              message: error.message || 'Failed to get post',
            },
          };
        }

        const data = await response.json();
        return {
          success: true,
          data,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'network_error',
            message: error instanceof Error ? error.message : 'Network error',
          },
        };
      }
    },
  };

  listPosts = {
    async execute(input: ListPostsInput = {}): Promise<ServiceResult<Post[]>> {
      try {
        const params = new URLSearchParams();
        if (input.userId) params.set('userId', input.userId);
        if (input.campaignId) params.set('campaignId', input.campaignId);
        if (input.status) params.set('status', input.status);
        if (input.limit) params.set('limit', input.limit.toString());
        if (input.offset) params.set('offset', input.offset.toString());

        const url = `/api/v1/posts?${params.toString()}`;
        const response = await fetch(url, {
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Failed to list posts' }));
          return {
            success: false,
            error: {
              code: 'list_failed',
              message: error.message || 'Failed to list posts',
            },
          };
        }

        const data = await response.json();
        return {
          success: true,
          data,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'network_error',
            message: error instanceof Error ? error.message : 'Network error',
          },
        };
      }
    },
  };

  savePost = {
    async execute(input: SavePostInput): Promise<ServiceResult<Post>> {
      try {
        const response = await fetch(`/api/v1/posts/${input.postId}/save`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Failed to save post' }));
          return {
            success: false,
            error: {
              code: 'save_failed',
              message: error.message || 'Failed to save post',
            },
          };
        }

        const data = await response.json();
        return {
          success: true,
          data,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'network_error',
            message: error instanceof Error ? error.message : 'Network error',
          },
        };
      }
    },
  };

  publishPost = {
    async execute(input: PublishPostInput): Promise<ServiceResult<PublishPostResult>> {
      try {
        const response = await fetch(`/api/v1/posts/${input.postId}/publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Failed to publish post' }));
          return {
            success: false,
            error: {
              code: 'publish_failed',
              message: error.message || 'Failed to publish post',
            },
          };
        }

        const data = await response.json();
        return {
          success: true,
          data,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'network_error',
            message: error instanceof Error ? error.message : 'Network error',
          },
        };
      }
    },
  };

  duplicatePost = {
    async execute(input: DuplicatePostInput): Promise<ServiceResult<Post>> {
      try {
        const response = await fetch(`/api/v1/posts/${input.postId}/duplicate`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Failed to duplicate post' }));
          return {
            success: false,
            error: {
              code: 'duplicate_failed',
              message: error.message || 'Failed to duplicate post',
            },
          };
        }

        const data = await response.json();
        return {
          success: true,
          data,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'network_error',
            message: error instanceof Error ? error.message : 'Network error',
          },
        };
      }
    },
  };

  getPostAnalytics = {
    async execute(input: GetPostAnalyticsInput): Promise<ServiceResult<PostAnalytics[]>> {
      try {
        const response = await fetch(`/api/v1/posts/${input.postId}/analytics`, {
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Failed to get analytics' }));
          return {
            success: false,
            error: {
              code: 'analytics_failed',
              message: error.message || 'Failed to get analytics',
            },
          };
        }

        const data = await response.json();
        return {
          success: true,
          data,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'network_error',
            message: error instanceof Error ? error.message : 'Network error',
          },
        };
      }
    },
  };
}

export const postServiceClient = new PostServiceClient();

