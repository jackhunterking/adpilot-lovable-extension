/**
 * Post Service Contract
 * Defines the interface for post-related operations
 */

import type { Post, PostAnalytics } from '@/lib/types/post';
import type { ServiceAction, ServiceResult } from './types';

export interface PostService {
  createPost: ServiceAction<CreatePostInput, Post>;
  updatePost: ServiceAction<UpdatePostInput, Post>;
  deletePost: ServiceAction<DeletePostInput, void>;
  getPost: ServiceAction<GetPostInput, Post>;
  listPosts: ServiceAction<ListPostsInput, Post[]>;
  savePost: ServiceAction<SavePostInput, Post>;
  publishPost: ServiceAction<PublishPostInput, PublishPostResult>;
  duplicatePost: ServiceAction<DuplicatePostInput, Post>;
  getPostAnalytics: ServiceAction<GetPostAnalyticsInput, PostAnalytics[]>;
}

// Input types
export interface CreatePostInput {
  userId: string;
  campaignId?: string;
  lovableProjectId?: string;
  name: string;
  status?: 'draft' | 'scheduled';
}

export interface UpdatePostInput {
  postId: string;
  name?: string;
  status?: 'draft' | 'scheduled' | 'published' | 'failed';
}

export interface DeletePostInput {
  postId: string;
}

export interface GetPostInput {
  postId: string;
}

export interface ListPostsInput {
  userId?: string;
  campaignId?: string;
  status?: 'draft' | 'scheduled' | 'published' | 'failed';
  limit?: number;
  offset?: number;
}

export interface SavePostInput {
  postId: string;
  postText?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'none';
  publishToFacebook?: boolean;
  publishToInstagram?: boolean;
  scheduleType?: 'immediate' | 'scheduled';
  scheduledAt?: string;
}

export interface PublishPostInput {
  postId: string;
}

export interface PublishPostResult {
  success: boolean;
  facebookPostId?: string;
  instagramMediaId?: string;
  errors?: {
    facebook?: string;
    instagram?: string;
  };
}

export interface DuplicatePostInput {
  postId: string;
}

export interface GetPostAnalyticsInput {
  postId: string;
}

