export interface MarketProvider { readonly label: string; next(prices: number[], random: () => number): { prices: number[]; growth: number; climate: string } }
export const fictionalMarket: MarketProvider = {
  label: '虛構市場・非真實行情',
  next(prices, random) {
    const shock = (random() - .5) * .08;
    return { prices: prices.map(p => Math.max(5, p * (1 + shock + (random() - .5) * .06))), growth: shock / 3, climate: shock > .015 ? '景氣擴張' : shock < -.015 ? '景氣降溫' : '平穩發展' };
  }
};
