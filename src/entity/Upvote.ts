import { Column, Entity, Index, ManyToOne, PrimaryColumn } from 'typeorm';
import { Post } from './Post';
import { User } from './User';

@Entity()
export class Upvote {
  @PrimaryColumn({ type: 'text' })
  @Index()
  postId: string;

  @PrimaryColumn({ type: 'text' })
  @Index()
  userId: string;

  @Column({ default: () => 'now()' })
  createdAt: Date;

  @ManyToOne(() => Post, {
    lazy: true,
    onDelete: 'CASCADE',
  })
  post: Promise<Post>;

  @ManyToOne(() => User, {
    lazy: true,
    onDelete: 'CASCADE',
  })
  user: Promise<User>;
}
