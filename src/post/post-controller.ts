import { Body, Controller, Post } from '@nestjs/common';

import { CreatePostDto } from './post.dto';
import PostService from './post-service';

@Controller('posts')
export default class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  createPost(@Body() { title, content }: CreatePostDto) {
    return this.postService.createPost(title, content);
  }
}
