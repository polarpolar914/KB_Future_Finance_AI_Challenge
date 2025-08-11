import { defineStore } from 'pinia';

type RiskState = {
  lastScore?: number;
  subScores?: Record<string, number>;
};

export const useRiskStore = defineStore('risk', {
  state: (): RiskState => ({ lastScore: undefined, subScores: undefined }),
  actions: {
    setScore(score: number, sub: Record<string, number>) {
      this.lastScore = score;
      this.subScores = sub;
    }
  }
});
