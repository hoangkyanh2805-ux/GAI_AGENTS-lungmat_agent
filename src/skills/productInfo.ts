import { Skill, SkillResult } from '../types';

interface Product {
  name: string;
  price: string;
  description: string;
  features: string[];
}

const CATALOG: Record<string, Product> = {
  starter: {
    name: 'Starter Plan',
    price: '$29/month',
    description: 'For solo founders getting started with AI automation.',
    features: ['5 active workflows', 'Telegram bot', 'Supabase logging', 'Email support'],
  },
  pro: {
    name: 'Pro Plan',
    price: '$99/month',
    description: 'For growing teams that need more power.',
    features: [
      'Unlimited workflows',
      'Multi-agent system',
      'Execution traces',
      'Priority support',
      'Custom integrations',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Full white-glove setup and dedicated support.',
    features: [
      'Dedicated agent cluster',
      'SLA guarantee',
      'On-premise option',
      'Custom training',
      'Direct engineer access',
    ],
  },
};

export class ProductInfoSkill implements Skill {
  name = 'productInfo';
  command = '/product_info';
  description = 'Get product and pricing information';

  async execute(payload: Record<string, unknown>): Promise<SkillResult> {
    const plan =
      typeof payload.plan === 'string' ? payload.plan.toLowerCase() : '';
    const product = CATALOG[plan];

    if (plan && product) {
      const features = product.features.map((f) => `  • ${f}`).join('\n');
      return {
        reply:
          `*${product.name}* — ${product.price}\n\n` +
          `${product.description}\n\n*Features:*\n${features}`,
        next_actions: ['request_demo', 'create_proposal'],
      };
    }

    const list = Object.values(CATALOG)
      .map((p) => `*${p.name}*: ${p.price} — ${p.description}`)
      .join('\n\n');

    return {
      reply:
        '*Product Catalog*\n\n' +
        list +
        '\n\n_Send /product_info with payload.plan=starter|pro|enterprise for details._',
      next_actions: [],
    };
  }
}
