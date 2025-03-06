import { Injectable } from '@nestjs/common';

import PostRepository from './post-repository';

@Injectable()
export default class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async createPost(title: string, content: string) {
    return this.postRepository.create(title, content);
  }
}
