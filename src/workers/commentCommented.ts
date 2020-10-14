import { envBasedName, messageToJson, Worker } from './worker';
import { Comment } from '../entity';
import {
  baseNotificationEmailData,
  sendEmail,
  truncateComment,
} from '../common';
import { fetchUser, getDiscussionLink } from '../common';

interface Data {
  userId: string;
  childCommentId: string;
  postId: string;
}

const worker: Worker = {
  topic: 'comment-commented',
  subscription: envBasedName('comment-commented-mail'),
  handler: async (message, con, logger): Promise<void> => {
    const data: Data = messageToJson(message);
    try {
      const comment = await con
        .getRepository(Comment)
        .findOne(data.childCommentId, { relations: ['post', 'parent'] });
      const parent = await comment.parent;
      const [author, commenter] = await Promise.all([
        fetchUser(parent.userId),
        fetchUser(data.userId),
      ]);
      const post = await comment.post;
      if (
        parent &&
        parent.userId !== data.userId &&
        author.id !== post.authorId
      ) {
        const link = getDiscussionLink(post.id);
        await sendEmail({
          ...baseNotificationEmailData,
          to: author.email,
          templateId: 'd-90c229bde4af427c8708a7615bfd85b4',
          dynamicTemplateData: {
            /* eslint-disable @typescript-eslint/camelcase */
            profile_image: commenter.image,
            full_name: commenter.name,
            main_comment: truncateComment(parent),
            new_comment: truncateComment(comment),
            main_comment_link: link,
            post_title: post.title,
            discussion_link: link,
            user_reputation: commenter.reputation,
            /* eslint-enable @typescript-eslint/camelcase */
          },
        });
        logger.info(
          {
            data,
            messageId: message.id,
          },
          'comment email sent',
        );
      }
      message.ack();
    } catch (err) {
      logger.error(
        {
          data,
          messageId: message.id,
          err,
        },
        'failed to send comment email',
      );
      if (err.name === 'QueryFailedError') {
        message.ack();
      } else {
        message.nack();
      }
    }
  },
};

export default worker;
