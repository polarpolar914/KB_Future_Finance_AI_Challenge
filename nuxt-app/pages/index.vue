<template>
  <div>
    <section class="container-std section">
      <div class="grid md:grid-cols-2 items-center gap-10">
        <div class="space-y-6">
          <h1 class="text-4xl md:text-6xl font-semibold leading-tight tracking-tight">
            블록체인으로 <span class="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">무역 보험</span>을 더 투명하게
          </h1>
          <p class="text-slate-500 max-w-xl">스마트컨트랙트로 담보/청구 자동화</p>
          <div class="flex gap-3">
            <NuxtLink to="/deal-creation" class="btn btn-primary">즉시 견적 받기</NuxtLink>
            <NuxtLink to="/risk-analysis" class="btn btn-secondary">데모 보기</NuxtLink>
          </div>
        </div>
        <div class="card">
          <div class="grid grid-cols-2 gap-4">
            <div class="rounded-2xl p-4 bg-brand-50 ring-1 ring-brand-100">
              <div class="text-xs text-slate-500">보장 처리 시간</div>
              <div class="text-2xl font-semibold">-32%</div>
            </div>
            <div class="rounded-2xl p-4 bg-slate-50 ring-1 ring-slate-200">
              <div class="text-xs text-slate-500">청구 자동화율</div>
              <div class="text-2xl font-semibold">78%</div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="container-std section">
      <div class="card">
        <div class="card-header">
          <h2 class="text-lg font-semibold">플랫폼 뷰</h2>
        </div>
        <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <li><NuxtLink to="/deal-creation" class="btn btn-ghost w-full text-left">Deal Creation View</NuxtLink></li>
          <li><NuxtLink to="/deal-tracker" class="btn btn-ghost w-full text-left">Deal Tracker Dashboard</NuxtLink></li>
          <li><NuxtLink to="/claim-waterfall" class="btn btn-ghost w-full text-left">Claim Waterfall View</NuxtLink></li>
          <li><NuxtLink to="/risk-analysis" class="btn btn-ghost w-full text-left">Risk Analysis & Premium View</NuxtLink></li>
          <li><NuxtLink to="/market/insurance" class="btn btn-ghost w-full text-left">Insurance Market Dashboard</NuxtLink></li>
          <li><NuxtLink to="/buyer" class="btn btn-ghost w-full text-left">Buyer View</NuxtLink></li>
          <li><NuxtLink to="/seller" class="btn btn-ghost w-full text-left">Seller View</NuxtLink></li>
          <li><NuxtLink to="/guarantor" class="btn btn-ghost w-full text-left">Guarantor View</NuxtLink></li>
          <li><NuxtLink to="/insurer" class="btn btn-ghost w-full text-left">Insurer View</NuxtLink></li>
          <li><NuxtLink to="/document-center" class="btn btn-ghost w-full text-left">Document Center</NuxtLink></li>
          <li><NuxtLink to="/admin" class="btn btn-ghost w-full text-left">Admin View</NuxtLink></li>
          <li><NuxtLink to="/settlement-flow" class="btn btn-ghost w-full text-left">Settlement Flow View</NuxtLink></li>
          <li><NuxtLink to="/event-timeline" class="btn btn-ghost w-full text-left">Event Timeline</NuxtLink></li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// landing page with hero and navigation
</script>
