<script lang="ts">
  // 接收點擊事件與開啟狀態
  export let onClick: () => void
  export let isOpen = false
</script>

<button
  on:click={onClick}
  aria-label="Search"
  aria-expanded={isOpen}
  class="
    group flex items-center justify-center w-10 h-10 ml-2 rounded-full
    text-slate-500 hover:text-indigo-600 bg-transparent hover:bg-slate-100
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
    transition-all duration-300 active:scale-95
    {isOpen ? 'bg-slate-100 text-indigo-600' : ''}
  "
>
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
</button>
