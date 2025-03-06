import { Post } from './post.types';

export type CreatePostDto = Pick<Post, 'title' | 'content'>;
