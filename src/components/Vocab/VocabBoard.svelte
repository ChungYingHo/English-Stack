<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import type { VocabItem } from '@/utils/useVocabulary';

  export let vocabularies: VocabItem[] = [];
  
  let currentPage = 1;
  const itemsPerPage = 30;
  
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

  function playTTS(word: string, event?: MouseEvent) {
    if (event) event.stopPropagation(); 
    
    window.speechSynthesis.cancel(); 
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US'; 
    utterance.rate = 0.85;    
    window.speechSynthesis.speak(utterance);
  }

  const getCardColorClass = (freq: number) => {
    if (freq >= 5) return 'bg-rose-50 border-rose-200 shadow-rose-100 text-rose-950 ring-rose-300 hover:border-rose-300'; 
    if (freq >= 3) return 'bg-amber-50 border-amber-200 shadow-amber-100 text-amber-950 ring-amber-300 hover:border-amber-300'; 
    if (freq >= 2) return 'bg-sky-50 border-sky-200 shadow-sky-100 text-sky-950 ring-sky-300 hover:border-sky-300'; 
    return 'bg-white border-slate-200 shadow-slate-100 text-slate-800 hover:border-indigo-300 ring-indigo-300';
  };

  const getTagColorClass = (freq: number) => {
    if (freq >= 5) return 'bg-rose-100 text-rose-700 border-rose-200';
    if (freq >= 3) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (freq >= 2) return 'bg-sky-100 text-sky-700 border-sky-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };
</script>

<div class="w-full pb-24">
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
    {#each paginatedItems as item (item.word)}
      <button 
        class="text-left relative flex flex-col p-6 rounded-2xl border transition-all duration-300 shadow-sm hover:-translate-y-1 hover:shadow-lg hover:ring-2 {getCardColorClass(item.frequency)}"
        on:click={() => openModal(item)}
      >
        <div class="absolute top-5 right-5 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider border flex items-center gap-1 {getTagColorClass(item.frequency)}">
          <span>×</span>{item.frequency}
        </div>

        <div class="flex items-center gap-3 mb-1 pr-12">
          <h2 class="text-2xl font-extrabold tracking-tight">{item.word}</h2>
          <div 
            class="flex items-center justify-center w-8 h-8 rounded-full bg-white/50 border border-black/5 hover:bg-white text-slate-400 hover:text-indigo-600 transition-all active:scale-95 cursor-pointer" 
            on:click={(e) => playTTS(item.word, e)}
            on:keydown={(e) => e.key === 'Enter' && playTTS(item.word)}
            role="button"
            tabindex="0"
            title="Listen to pronunciation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          </div>
        </div>

        <div class="font-mono text-sm opacity-60 mb-3">{item.phonetic}</div>
        
        <div class="flex items-center gap-2 mb-4">
          <span class="text-[11px] font-bold px-2 py-0.5 rounded-md border bg-white/40 {getTagColorClass(item.frequency).replace('bg-', 'border-').replace('100', '200')}">
            {item.occurrences[0].pos}
          </span>
        </div>

        <div class="text-lg font-bold mb-3 opacity-90">{item.occurrences[0].meaning}</div>
        <div class="text-sm opacity-70 italic mt-auto pt-4 border-t border-black/5 leading-relaxed line-clamp-2">
          "{item.occurrences[0].example}"
        </div>
      </button>
    {/each}
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

{#if isModalOpen && selectedWord}
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" transition:fade={{ duration: 200 }}>
    <button 
      class="absolute inset-0 w-full h-full bg-slate-900/40 backdrop-blur-sm border-none cursor-default" 
      aria-label="Close modal" 
      on:click={closeModal}
    ></button>
    
    <div 
      class="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      in:fly={{ y: 20, duration: 300, delay: 100 }}
    >
      <div class="flex items-start justify-between p-6 border-b border-slate-100 bg-slate-50/50">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <h2 class="text-3xl font-black text-slate-800">{selectedWord.word}</h2>
            <button 
              class="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-all shadow-sm active:scale-95" 
              on:click={() => playTTS(selectedWord!.word)}
              title="Listen to pronunciation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            </button>
          </div>
          <div class="font-mono text-sm text-slate-500">{selectedWord.phonetic}</div>
        </div>
        <button class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors" on:click={closeModal}>✕</button>
      </div>

      <div class="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6 bg-slate-50/30">
        <div class="text-xs font-bold uppercase tracking-widest text-slate-400">
          Appeared in {selectedWord.frequency} article{selectedWord.frequency > 1 ? 's' : ''}
        </div>
        
        {#each selectedWord.occurrences as occ, index}
          <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-[11px] font-bold px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 text-slate-600">
                {occ.pos}
              </span>
              <span class="text-lg font-bold text-slate-800 ml-1">{occ.meaning}</span>
            </div>
            
            <p class="text-slate-600 italic leading-relaxed mb-4 text-[15px]">
              "{occ.example}"
            </p>
            
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div class="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Source</div>
              <a href={occ.articleLink} class="text-sm font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1 transition-colors group truncate max-w-[70%]">
                <span class="truncate">{occ.articleTitle}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="group-hover:translate-x-0.5 transition-transform"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </a>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2; /* 補上標準屬性解決 CSS 警告 */
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>