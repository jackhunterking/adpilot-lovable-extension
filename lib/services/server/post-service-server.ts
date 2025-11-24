/**
 * Post Service Server
 * Server-side implementation of post service operations
 */

import { createServerClient } from '@/lib/supabase/server';
import { publishPost as publishPostToMeta } from '@/lib/meta/post-publisher';
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

class PostServiceServer implements PostService {
  createPost = {
    async execute(input: CreatePostInput): Promise<ServiceResult<Post>> {
      try {
        const supabase = await createServerClient();
        
        const { data, error } = await supabase
          .from('social_posts')
          .insert({
            user_id: input.userId,
            campaign_id: input.campaignId,
            lovable_project_id: input.lovableProjectId,
            name: input.name,
            status: input.status || 'draft',
            publish_to_facebook: true,
            publish_to_instagram: true,
            schedule_type: 'immediate',
          })
          .select()
          .single();

        if (error) {
          return {
            success: false,
            error: {
              code: 'database_error',
              message: error.message,
            },
          };
        }

        return {
          success: true,
          data,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'server_error',
            message: error instanceof Error ? error.message : 'Server error',
          },
        };
      }
    },
  };

  updatePost = {
    async execute(input: UpdatePostInput): Promise<ServiceResult<Post>> {
      try {
        const supabase = await createServerClient();
        
        const updateData: Partial<Post> = {
          updated_at: new Date().toISOString(),
        };
        
        if (input.name !== undefined) updateData.name = input.name;
        if (input.status !== undefined) updateData.status = input.status;

        const { data, error } = await supabase
          .from('social_posts')
          .update(updateData)
          .eq('id', input.postId)
          .select()
          .single();

        if (error) {
          return {
            success: false,
            error: {
              code: 'database_error',
              message: error.message,
            },
          };
        }

        return {
          success: true,
          data,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'server_error',
            message: error instanceof Error ? error.message : 'Server error',
          },
        };
      }
    },
  };

  deletePost = {
    async execute(input: DeletePostInput): Promise<ServiceResult<void>> {
      try {
        const supabase = await createServerClient();
        
        const { error } = await supabase
          .from('social_posts')
          .delete()
          .eq('id', input.postId);

        if (error) {
          return {
            success: false,
            error: {
              code: 'database_error',
              message: error.message,
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
            code: 'server_error',
            message: error instanceof Error ? error.message : 'Server error',
          },
        };
      }
    },
  };

  getPost = {
    async execute(input: GetPostInput): Promise<ServiceResult<Post>> {
      try {
        const supabase = await createServerClient();
        
        const { data, error } = await supabase
          .from('social_posts')
          .select('*')
          .eq('id', input.postId)
          .single();

        if (error) {
          return {
            success: false,
            error: {
              code: 'database_error',
              message: error.message,
            },
          };
        }

        return {
          success: true,
          data,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'server_error',
            message: error instanceof Error ? error.message : 'Server error',
          },
        };
      }
    },
  };

  listPosts = {
    async execute(input: ListPostsInput = {}): Promise<ServiceResult<Post[]>> {
      try {
        const supabase = await createServerClient();
        
        let query = supabase.from('social_posts').select('*');
        
        if (input.userId) {
          query = query.eq('user_id', input.userId);
        }
        if (input.campaignId) {
          query = query.eq('campaign_id', input.campaignId);
        }
        if (input.status) {
          query = query.eq('status', input.status);
        }
        if (input.limit) {
          query = query.limit(input.limit);
        }
        if (input.offset) {
          query = query.range(input.offset, input.offset + (input.limit || 10) - 1);
        }
        
        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
          return {
            success: false,
            error: {
              code: 'database_error',
              message: error.message,
            },
          };
        }

        return {
          success: true,
          data: data || [],
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'server_error',
            message: error instanceof Error ? error.message : 'Server error',
          },
        };
      }
    },
  };

  savePost = {
    async execute(input: SavePostInput): Promise<ServiceResult<Post>> {
      try {
        const supabase = await createServerClient();
        
        const updateData: Partial<Post> = {
          updated_at: new Date().toISOString(),
        };
        
        if (input.postText !== undefined) updateData.post_text = input.postText;
        if (input.mediaUrl !== undefined) updateData.media_url = input.mediaUrl;
        if (input.mediaType !== undefined) updateData.media_type = input.mediaType;
        if (input.publishToFacebook !== undefined) updateData.publish_to_facebook = input.publishToFacebook;
        if (input.publishToInstagram !== undefined) updateData.publish_to_instagram = input.publishToInstagram;
        if (input.scheduleType !== undefined) updateData.schedule_type = input.scheduleType;
        if (input.scheduledAt !== undefined) updateData.scheduled_at = input.scheduledAt;

        const { data, error } = await supabase
          .from('social_posts')
          .update(updateData)
          .eq('id', input.postId)
          .select()
          .single();

        if (error) {
          return {
            success: false,
            error: {
              code: 'database_error',
              message: error.message,
            },
          };
        }

        return {
          success: true,
          data,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'server_error',
            message: error instanceof Error ? error.message : 'Server error',
          },
        };
      }
    },
  };

  publishPost = {
    async execute(input: PublishPostInput): Promise<ServiceResult<PublishPostResult>> {
      try {
        const supabase = await createServerClient();
        
        // Get user from session
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          return {
            success: false,
            error: {
              code: 'unauthorized',
              message: 'Not authenticated',
            },
          };
        }

        const result = await publishPostToMeta({
          postId: input.postId,
          userId: user.id,
        });

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'publish_error',
            message: error instanceof Error ? error.message : 'Publish failed',
          },
        };
      }
    },
  };

  duplicatePost = {
    async execute(input: DuplicatePostInput): Promise<ServiceResult<Post>> {
      try {
        const supabase = await createServerClient();
        
        // Get the original post
        const { data: originalPost, error: fetchError } = await supabase
          .from('social_posts')
          .select('*')
          .eq('id', input.postId)
          .single();

        if (fetchError || !originalPost) {
          return {
            success: false,
            error: {
              code: 'not_found',
              message: 'Post not found',
            },
          };
        }

        // Create duplicate
        const { data: duplicatePost, error: createError } = await supabase
          .from('social_posts')
          .insert({
            user_id: originalPost.user_id,
            campaign_id: originalPost.campaign_id,
            lovable_project_id: originalPost.lovable_project_id,
            name: `${originalPost.name} (Copy)`,
            status: 'draft',
            post_text: originalPost.post_text,
            media_type: originalPost.media_type,
            media_url: originalPost.media_url,
            publish_to_facebook: originalPost.publish_to_facebook,
            publish_to_instagram: originalPost.publish_to_instagram,
            schedule_type: originalPost.schedule_type,
          })
          .select()
          .single();

        if (createError) {
          return {
            success: false,
            error: {
              code: 'database_error',
              message: createError.message,
            },
          };
        }

        return {
          success: true,
          data: duplicatePost,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'server_error',
            message: error instanceof Error ? error.message : 'Server error',
          },
        };
      }
    },
  };

  getPostAnalytics = {
    async execute(input: GetPostAnalyticsInput): Promise<ServiceResult<PostAnalytics[]>> {
      try {
        const supabase = await createServerClient();
        
        const { data, error } = await supabase
          .from('post_analytics')
          .select('*')
          .eq('post_id', input.postId)
          .order('created_at', { ascending: false });

        if (error) {
          return {
            success: false,
            error: {
              code: 'database_error',
              message: error.message,
            },
          };
        }

        return {
          success: true,
          data: data || [],
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'server_error',
            message: error instanceof Error ? error.message : 'Server error',
          },
        };
      }
    },
  };
}

export const postServiceServer = new PostServiceServer();

