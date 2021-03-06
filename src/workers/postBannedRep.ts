import { messageToJson, Worker } from './worker';
import { increaseReputation } from '../common';
import { PostReport } from '../entity/PostReport';
import { Post } from '../entity';

interface Data {
  post: Post;
}

const worker: Worker = {
  subscription: 'post-banned-rep',
  handler: async (message, con, logger): Promise<void> => {
    const data: Data = messageToJson(message);
    try {
      const reports = await con
        .getRepository(PostReport)
        .find({ postId: data.post.id });
      await Promise.all(
        reports.map((report) =>
          increaseReputation(con, logger, report.userId, 1),
        ),
      );
      logger.info(
        {
          data,
          messageId: message.id,
        },
        'increased reputation due to post banned or removed',
      );
    } catch (err) {
      logger.error(
        {
          data,
          messageId: message.id,
          err,
        },
        'failed to increase reputation due to post banned or removed',
      );
    }
  },
};

export default worker;
