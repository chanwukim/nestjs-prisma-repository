import { Test, TestingModule } from '@nestjs/testing';

import DbModule from './db-module';
import DbProvider from './db-provider';
import TransactionManager from './transaction-manager';

import PostRepository from '../post/post-repository';

describe('TransactionManager', () => {
  let transactionManager: TransactionManager;
  let dbProvider: DbProvider;
  let postRepository: PostRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DbModule],
      providers: [TransactionManager, PostRepository],
    }).compile();

    transactionManager = module.get<TransactionManager>(TransactionManager);
    dbProvider = module.get<DbProvider>(DbProvider);
    postRepository = module.get<PostRepository>(PostRepository);
  });

  afterEach(async () => {
    await postRepository.deleteAll()();
  });

  it('should commit transaction successfully', async () => {
    // given
    const title = 'Transaction Test';
    const content = 'Transaction Content';

    // when
    const post = await transactionManager.tx('ReadCommitted', async (tx) => {
      return await postRepository.create(title, content)(tx);
    });

    // then
    expect(post).toBeDefined();
    expect(post.title).toBe(title);
    expect(post.content).toBe(content);

    const foundPost = await postRepository.findById(post.id)();
    expect(foundPost).toBeDefined();
    expect(foundPost.title).toBe(post.title);
  });

  it('should rollback transaction on error', async () => {
    // given
    const title = 'Rollback Test';
    const content = 'Rollback Content';

    // when & then
    try {
      await transactionManager.tx('ReadCommitted', async (tx) => {
        await postRepository.create(title, content)(tx);
        throw new Error('Forced error for rollback test');
      });
    } catch (error) {
      expect(error.message).toBe('Forced error for rollback test');
    }

    const posts = await postRepository.findAll()();
    const rollbackPost = posts.find((p) => p.title === title);
    expect(rollbackPost).toBeUndefined();
  });

  it('should handle nested transactions', async () => {
    // given
    const title1 = 'Outer Transaction';
    const content1 = 'Outer Content';
    const title2 = 'Inner Transaction';
    const content2 = 'Inner Content';

    // when
    const result = await transactionManager.tx(
      'ReadCommitted',
      async (outerTx) => {
        const post1 = await postRepository.create(title1, content1)(outerTx);

        const post2 = await transactionManager.tx(
          'ReadCommitted',
          async (innerTx) => {
            return await postRepository.create(title2, content2)(innerTx);
          },
        );

        return { post1, post2 };
      },
    );

    // then
    expect(result.post1).toBeDefined();
    expect(result.post1.title).toBe(title1);
    expect(result.post2).toBeDefined();
    expect(result.post2.title).toBe(title2);

    const posts = await postRepository.findAll()();
    expect(posts.length).toBeGreaterThanOrEqual(2);
    expect(posts.some((p) => p.id === result.post1.id)).toBeTruthy();
    expect(posts.some((p) => p.id === result.post2.id)).toBeTruthy();
  });

  it('should rollback outer transaction when inner transaction fails', async () => {
    // given
    const title1 = 'Outer Will Rollback';
    const content1 = 'Outer Content';
    const title2 = 'Inner Will Fail';
    const content2 = 'Inner Content';

    // when & then
    try {
      await transactionManager.tx('ReadCommitted', async (outerTx) => {
        await postRepository.create(title1, content1)(outerTx);

        await transactionManager.tx('ReadCommitted', async (innerTx) => {
          await postRepository.create(title2, content2)(innerTx);
          throw new Error('Inner transaction error');
        });

        return true;
      });
    } catch (error) {
      expect(error.message).toBe('Inner transaction error');
    }

    const posts = await postRepository.findAll()();
    const outerPost = posts.find((p) => p.title === title1);
    const innerPost = posts.find((p) => p.title === title2);
    expect(outerPost).toBeUndefined();
    expect(innerPost).toBeUndefined();
  });
});
