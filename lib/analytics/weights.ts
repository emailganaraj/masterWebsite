import { getSettingValue } from "@/lib/queries/site";

export type TrendingWeights = {
  views2hWeight: number;
  views24hWeight: number;
  gravity: number;
};

const DEFAULTS: TrendingWeights = {
  views2hWeight: 3,
  views24hWeight: 1,
  gravity: 1.5,
};

export async function getTrendingWeights(): Promise<TrendingWeights> {
  const value = (await getSettingValue("trending_weights")) as Partial<TrendingWeights> | null;
  return {
    views2hWeight: value?.views2hWeight ?? DEFAULTS.views2hWeight,
    views24hWeight: value?.views24hWeight ?? DEFAULTS.views24hWeight,
    gravity: value?.gravity ?? DEFAULTS.gravity,
  };
}
