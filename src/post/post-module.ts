import { Module } from '@nestjs/common';

import { DbModule } from '../db/db-module';

import PostController from './post-controller';
import PostService from './post-service';
import PostRepository from './post-repository';

@Module({
  imports: [DbModule],
  controllers: [PostController],
  providers: [PostService, PostRepository],
})
export class PostModule {}
