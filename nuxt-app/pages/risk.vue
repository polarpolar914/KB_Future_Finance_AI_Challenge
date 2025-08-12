<template>
  <form @submit.prevent="onSubmit">
    <div>
      <label>amount</label>
      <input v-model="values.amount" name="amount" />
      <span>{{ errors.amount }}</span>
    </div>
    <div>
      <label>days</label>
      <input v-model="values.days" name="days" />
      <span>{{ errors.days }}</span>
    </div>
    <button type="submit">Score</button>

    <div v-if="risk.lastScore !== undefined">
      <p>ml_score: {{ risk.lastScore }}</p>
      <pre>{{ risk.subScores }}</pre>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useRiskStore } from '~/stores/useRiskStore';

const risk = useRiskStore();

const schema = yup.object({
  amount: yup.number().required().min(1),
  days: yup.number().required().min(1)
});

const { handleSubmit, values, errors } = useForm({
  validationSchema: schema,
  initialValues: { amount: 1000, days: 30 }
});

const config = useRuntimeConfig();

const onSubmit = handleSubmit(async (vals) => {
  const res = await $fetch<{ ml_score: number; sub_scores: Record<string, number> }>(
    `${config.public.apiBase}/api/risk/score`,
    { method: 'POST', body: { features: vals } }
  );
  risk.setScore(res.ml_score, res.sub_scores);
});
</script>
