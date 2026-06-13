<script lang="ts">
  // 共用分頁控制元件 (Prev / 頁碼 / Next)，供 VocabBoard 系列共用。
  export let currentPage = 1
  export let totalPages = 1
  export let onPrev: () => void
  export let onNext: () => void

  const btnClass =
    'px-5 py-2 rounded-xl text-sm font-bold border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50 disabled:pointer-events-none transition-all'
</script>

{#if totalPages > 1}
  <div class="flex items-center justify-center gap-4">
    <button class={btnClass} disabled={currentPage === 1} on:click={onPrev}>
      Prev
    </button>
    <div class="text-sm font-bold text-slate-500 font-mono">
      {currentPage} / {totalPages}
    </div>
    <button class={btnClass} disabled={currentPage === totalPages} on:click={onNext}>
      Next
    </button>
  </div>
{/if}
