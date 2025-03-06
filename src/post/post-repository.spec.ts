import { Test } from '@nestjs/testing';

import PostRepository from './post-repository';
import DbProvider from '..//db/db-provider';

describe('PostRepository', () => {
  let postRepository: PostRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PostRepository, DbProvider],
    }).compile();

    postRepository = module.get<PostRepository>(PostRepository);
  });

  afterEach(async () => {
    await postRepository.deleteAll()();
  });

  it('should create a post', async () => {
    // when
    const post = await postRepository.create('Test Title', 'Test Content')();

    // then
    expect(post).toMatchObject({
      title: 'Test Title',
      content: 'Test Content',
    });
  });
});
