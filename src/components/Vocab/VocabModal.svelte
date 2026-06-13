<script lang="ts">
  import { fade, fly } from 'svelte/transition'
  import type { VocabItem } from '@/utils/useVocabulary'
  import { speak } from '@/utils/tts'

  // 單字詳情彈窗，供 VocabBoard (卡片) 與 VocabBoardToefl (表格) 共用。
  export let item: VocabItem
  export let onClose: () => void
  export let maxWidth = 'max-w-xl'
  // 文案以 prop 傳入，讓兩種版面維持各自語系 (英 / 中)。
  export let countLabel: (n: number) => string = (n) =>
    `Appeared in ${n} article${n > 1 ? 's' : ''}`
  export let sourceLabel = 'Source'

  // 將 '-' 佔位符視為空值
  const clean = (v: string | undefined) => (v && v !== '-' ? v : '')
</script>

<div
  class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
  transition:fade={{ duration: 200 }}
>
  <button
    class="absolute inset-0 w-full h-full bg-slate-900/40 backdrop-blur-sm border-none cursor-default"
    aria-label="Close modal"
    on:click={onClose}
  ></button>

  <div
    class="relative w-full {maxWidth} bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
    in:fly={{ y: 20, duration: 300, delay: 100 }}
  >
    <div class="flex items-start justify-between p-6 border-b border-slate-100 bg-slate-50/50">
      <div>
        <div class="flex items-center gap-3 mb-1">
          <h2 class="text-2xl font-black text-slate-800">{item.word}</h2>
          <button
            class="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
            on:click={() => speak(item.word)}
            title="Listen to pronunciation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
          </button>
        </div>
        {#if clean(item.phonetic)}
          <div class="font-mono text-sm text-slate-400">{item.phonetic}</div>
        {/if}
      </div>
      <button
        class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
        on:click={onClose}
      >✕</button>
    </div>

    <div class="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4 bg-slate-50/30">
      <div class="text-xs font-bold uppercase tracking-widest text-slate-400">
        {countLabel(item.frequency)}
      </div>

      {#each item.occurrences as occ, i (i)}
        <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div class="flex items-center gap-2 mb-3">
            {#if clean(occ.pos)}
              <span class="text-[11px] font-bold px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 text-slate-600">{occ.pos}</span>
            {/if}
            <span class="text-lg font-bold text-slate-800">{occ.meaning}</span>
          </div>
          {#if occ.example}
            <p class="text-slate-600 italic leading-relaxed mb-4 text-[15px]">"{occ.example}"</p>
          {/if}
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div class="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{sourceLabel}</div>
            <a href={occ.articleLink} class="text-sm font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1 transition-colors group truncate max-w-[70%]">
              <span class="truncate">{occ.articleTitle}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="group-hover:translate-x-0.5 transition-transform flex-shrink-0"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </a>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>
