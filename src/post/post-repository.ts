import { Injectable } from '@nestjs/common';

import DbProvider from '../db/db-provider';

import { Post } from './post.types';
import { DbTxType } from 'src/db/db.types';

@Injectable()
export default class PostRepository {
  constructor(private readonly db: DbProvider) {}

  create(title: string, content: string) {
    return (tx?: DbTxType) =>
      (tx ?? this.db).post.create({
        data: { title, content },
      });
  }

  findById(id: string) {
    return (tx?: DbTxType) =>
      (tx ?? this.db).post.findUnique({
        where: { id },
      });
  }

  findAll() {
    return (tx?: DbTxType) => (tx ?? this.db).post.findMany();
  }

  update(post: Post) {
    return (tx?: DbTxType) =>
      (tx ?? this.db).post.update({
        where: { id: post.id },
        data: post,
      });
  }

  delete(id: string) {
    return (tx?: DbTxType) =>
      (tx ?? this.db).post.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
  }

  deleteAll() {
    return (tx?: DbTxType) => (tx ?? this.db).post.deleteMany();
  }
}
