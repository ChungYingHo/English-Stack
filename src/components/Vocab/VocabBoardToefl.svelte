<script lang="ts">
  import type { VocabItem } from '@/utils/useVocabulary'
  import { speak } from '@/utils/tts'
  import Pagination from '@/components/Vocab/Pagination.svelte'
  import VocabModal from '@/components/Vocab/VocabModal.svelte'

  export let vocabularies: VocabItem[] = []

  let currentPage = 1
  const itemsPerPage = 50

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

  const toeflCountLabel = (n: number) => `出現於 ${n} 篇文章`

  const getFreqClass = (freq: number) => {
    if (freq >= 5) return 'freq-high'
    if (freq >= 3) return 'freq-med'
    if (freq >= 2) return 'freq-low'
    return ''
  }

  const getFreqBadgeClass = (freq: number) => {
    if (freq >= 5) return 'badge-high'
    if (freq >= 3) return 'badge-med'
    if (freq >= 2) return 'badge-low'
    return 'badge-default'
  }
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
        {#each paginatedItems as item (item.word)}
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
                on:click={(e) => playWord(item.word, e)}
                on:keydown={(e) => e.key === 'Enter' && playWord(item.word, e)}
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

  <Pagination {currentPage} {totalPages} onPrev={() => changePage(-1)} onNext={() => changePage(1)} />
</div>

<!-- Detail Modal -->
{#if isModalOpen && selectedWord}
  <VocabModal item={selectedWord} countLabel={toeflCountLabel} sourceLabel="來源" onClose={closeModal} />
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
</style>
