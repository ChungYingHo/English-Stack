<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import type { VocabItem } from '@/utils/useVocabulary';

  export let vocabularies: VocabItem[] = [];

  let currentPage = 1;
  const itemsPerPage = 50;

  $: totalPages = Math.max(1, Math.ceil(vocabularies.length / itemsPerPage));
  $: paginatedItems = vocabularies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  let selectedWord: VocabItem | null = null;
  let isModalOpen = false;

  function openModal(item: VocabItem) {
    selectedWord = item;
    isModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    isModalOpen = false;
    setTimeout(() => { selectedWord = null; }, 300);
    document.body.style.overflow = '';
  }

  function changePage(delta: number) {
    currentPage += delta;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function playTTS(word: string, event?: MouseEvent | KeyboardEvent) {
    if (event) event.stopPropagation();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }

  const getFreqClass = (freq: number) => {
    if (freq >= 5) return 'freq-high';
    if (freq >= 3) return 'freq-med';
    if (freq >= 2) return 'freq-low';
    return '';
  };

  const getFreqBadgeClass = (freq: number) => {
    if (freq >= 5) return 'badge-high';
    if (freq >= 3) return 'badge-med';
    if (freq >= 2) return 'badge-low';
    return 'badge-default';
  };
</script>

<div class="w-full pb-24">
  <div class="overflow-x-auto rounded-xl border border-slate-200 shadow-sm mb-8">
    <table class="w-full text-sm border-collapse">
      <thead>
        <tr class="bg-slate-50 text-left">
          <th class="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 w-6">×</th>
          <th class="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">單字</th>
          <th class="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 hidden sm:table-cell">音標</th>
          <th class="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 w-16">詞性</th>
          <th class="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">中文</th>
          <th class="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 w-10"></th>
        </tr>
      </thead>
      <tbody>
        {#each paginatedItems as item, i (item.word)}
          <tr
            class="vocab-row border-b border-slate-100 cursor-pointer transition-colors {getFreqClass(item.frequency)}"
            on:click={() => openModal(item)}
          >
            <!-- Frequency badge -->
            <td class="px-4 py-2.5 text-center">
              {#if item.frequency >= 2}
                <span class="inline-flex items-center justify-center text-[10px] font-black w-5 h-5 rounded-full {getFreqBadgeClass(item.frequency)}">
                  {item.frequency}
                </span>
              {/if}
            </td>

            <!-- Word -->
            <td class="px-4 py-2.5 font-bold text-indigo-700 text-[0.9rem] whitespace-nowrap">
              {item.word}
            </td>

            <!-- Phonetic -->
            <td class="px-4 py-2.5 text-slate-400 font-mono text-xs hidden sm:table-cell whitespace-nowrap">
              {item.phonetic !== '-' ? item.phonetic : ''}
            </td>

            <!-- POS -->
            <td class="px-4 py-2.5">
              {#if item.occurrences[0].pos && item.occurrences[0].pos !== '-'}
                <span class="text-[11px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                  {item.occurrences[0].pos}
                </span>
              {/if}
            </td>

            <!-- Meaning -->
            <td class="px-4 py-2.5 text-slate-700 text-[0.88rem] leading-snug">
              {item.occurrences[0].meaning}
            </td>

            <!-- TTS button -->
            <td class="px-3 py-2.5 text-center">
              <button
                class="tts-btn"
                title="Listen"
                on:click={(e) => playTTS(item.word, e)}
                on:keydown={(e) => e.key === 'Enter' && playTTS(item.word, e)}
                tabindex="0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if totalPages > 1}
    <div class="flex items-center justify-center gap-4">
      <button
        class="px-5 py-2 rounded-xl text-sm font-bold border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50 disabled:pointer-events-none transition-all"
        disabled={currentPage === 1}
        on:click={() => changePage(-1)}
      >
        Prev
      </button>
      <div class="text-sm font-bold text-slate-500 font-mono">
        {currentPage} / {totalPages}
      </div>
      <button
        class="px-5 py-2 rounded-xl text-sm font-bold border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50 disabled:pointer-events-none transition-all"
        disabled={currentPage === totalPages}
        on:click={() => changePage(1)}
      >
        Next
      </button>
    </div>
  {/if}
</div>

<!-- Detail Modal -->
{#if isModalOpen && selectedWord}
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" transition:fade={{ duration: 200 }}>
    <button
      class="absolute inset-0 w-full h-full bg-slate-900/40 backdrop-blur-sm border-none cursor-default"
      aria-label="Close modal"
      on:click={closeModal}
    ></button>

    <div
      class="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      in:fly={{ y: 20, duration: 300, delay: 100 }}
    >
      <div class="flex items-start justify-between p-6 border-b border-slate-100 bg-slate-50/50">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <h2 class="text-2xl font-black text-slate-800">{selectedWord.word}</h2>
            <button
              class="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
              on:click={() => playTTS(selectedWord!.word)}
              title="Listen to pronunciation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            </button>
          </div>
          {#if selectedWord.phonetic && selectedWord.phonetic !== '-'}
            <div class="font-mono text-sm text-slate-400">{selectedWord.phonetic}</div>
          {/if}
        </div>
        <button class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors" on:click={closeModal}>✕</button>
      </div>

      <div class="p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
        <div class="text-xs font-bold uppercase tracking-widest text-slate-400">
          出現於 {selectedWord.frequency} 篇文章
        </div>

        {#each selectedWord.occurrences as occ}
          <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div class="flex items-center gap-2 mb-2">
              {#if occ.pos && occ.pos !== '-'}
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-md border border-slate-200 bg-white text-slate-500">{occ.pos}</span>
              {/if}
              <span class="text-base font-bold text-slate-800">{occ.meaning}</span>
            </div>
            {#if occ.example}
              <p class="text-slate-500 italic text-sm leading-relaxed mb-3">"{occ.example}"</p>
            {/if}
            <div class="pt-2 border-t border-slate-200 flex items-center justify-between">
              <div class="text-[10px] text-slate-400 uppercase tracking-wider font-medium">來源</div>
              <a href={occ.articleLink} class="text-sm font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1 transition-colors group truncate max-w-[70%]">
                <span class="truncate">{occ.articleTitle}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="group-hover:translate-x-0.5 transition-transform flex-shrink-0"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </a>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  /* Row hover & frequency coloring */
  .vocab-row:hover { background: #f8fafc; }
  .vocab-row.freq-high { background: #fff1f2; }
  .vocab-row.freq-high:hover { background: #ffe4e6; }
  .vocab-row.freq-med { background: #fffbeb; }
  .vocab-row.freq-med:hover { background: #fef3c7; }
  .vocab-row.freq-low { background: #f0f9ff; }
  .vocab-row.freq-low:hover { background: #e0f2fe; }

  /* Frequency badges */
  .badge-high { background: #fecdd3; color: #be123c; }
  .badge-med  { background: #fde68a; color: #92400e; }
  .badge-low  { background: #bae6fd; color: #0369a1; }
  .badge-default { background: #f1f5f9; color: #64748b; }

  /* TTS button */
  .tts-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border-radius: 50%;
    color: #cbd5e1; background: transparent; border: 1px solid transparent;
    cursor: pointer; transition: all 0.15s ease;
  }
  .tts-btn:hover { color: #4f46e5; background: #eef2ff; border-color: #c7d2fe; }

  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>
