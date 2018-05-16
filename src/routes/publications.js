import Router from 'koa-router';
import publication from '../models/publication';

const router = Router({
  prefix: '/publications',
});

router.get(
  '/',
  async (ctx) => {
    const models = await publication.getEnabled();

    ctx.status = 200;
    ctx.body = models;
  },
);

export default router;