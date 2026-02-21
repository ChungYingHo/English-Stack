<script lang="ts">
  // 接收點擊事件
  export let onClick: () => void;
</script>

<button
  on:click={onClick}
  aria-label="Search"
  class="
    group flex items-center justify-center w-10 h-10 ml-2 rounded-full
    text-white/70 hover:text-white bg-transparent hover:bg-white/10
    transition-all duration-300 active:scale-95
  "
>
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
</button>