import type { Module } from 'vuex'

interface RiskState {
  lastScore?: number
  subScores?: Record<string, number>
}

const risk: Module<RiskState, any> = {
  namespaced: true,
  state: () => ({ lastScore: undefined, subScores: undefined }),
  mutations: {
    setScore(state, { score, sub }: { score: number; sub: Record<string, number> }) {
      state.lastScore = score
      state.subScores = sub
    }
  }
}

export default risk
