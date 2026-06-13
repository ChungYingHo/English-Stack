<script lang="ts">
  import type { VocabItem } from '@/utils/useVocabulary'
  import { speak } from '@/utils/tts'
  import Pagination from '@/components/Vocab/Pagination.svelte'
  import VocabModal from '@/components/Vocab/VocabModal.svelte'

  export let vocabularies: VocabItem[] = []

  let currentPage = 1
  const itemsPerPage = 30

  $: totalPages = Math.max(1, Math.ceil(vocabularies.length / itemsPerPage))
  $: paginatedItems = vocabularies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  let selectedWord: VocabItem | null = null
  let isModalOpen = false

  function openModal(item: VocabItem) {
    selectedWord = item
    isModalOpen = true
    document.body.style.overflow = 'hidden'
  }

  function closeModal() {
    isModalOpen = false
    setTimeout(() => { selectedWord = null }, 300)
    document.body.style.overflow = ''
  }

  function changePage(delta: number) {
    currentPage += delta
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function playWord(word: string, event: MouseEvent | KeyboardEvent) {
    event.stopPropagation()
    speak(word)
  }

  const getCardColorClass = (freq: number) => {
    if (freq >= 5) return 'bg-rose-50 border-rose-200 shadow-rose-100 text-rose-950 ring-rose-300 hover:border-rose-300'
    if (freq >= 3) return 'bg-amber-50 border-amber-200 shadow-amber-100 text-amber-950 ring-amber-300 hover:border-amber-300'
    if (freq >= 2) return 'bg-sky-50 border-sky-200 shadow-sky-100 text-sky-950 ring-sky-300 hover:border-sky-300'
    return 'bg-white border-slate-200 shadow-slate-100 text-slate-800 hover:border-indigo-300 ring-indigo-300'
  }

  const getTagColorClass = (freq: number) => {
    if (freq >= 5) return 'bg-rose-100 text-rose-700 border-rose-200'
    if (freq >= 3) return 'bg-amber-100 text-amber-700 border-amber-200'
    if (freq >= 2) return 'bg-sky-100 text-sky-700 border-sky-200'
    return 'bg-slate-100 text-slate-600 border-slate-200'
  }
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
            on:click={(e) => playWord(item.word, e)}
            on:keydown={(e) => e.key === 'Enter' && playWord(item.word, e)}
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
        {#if item.occurrences[0].example}
          <div class="text-sm opacity-70 italic mt-auto pt-4 border-t border-black/5 leading-relaxed line-clamp-2">
            "{item.occurrences[0].example}"
          </div>
        {/if}
      </button>
    {/each}
  </div>

  <Pagination {currentPage} {totalPages} onPrev={() => changePage(-1)} onNext={() => changePage(1)} />
</div>

{#if isModalOpen && selectedWord}
  <VocabModal item={selectedWord} maxWidth="max-w-2xl" onClose={closeModal} />
{/if}

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2; /* 補上標準屬性解決 CSS 警告 */
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
