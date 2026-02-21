<script lang="ts">
  import { fly } from "svelte/transition"
  import { cubicOut } from "svelte/easing"
  import type { MenuItem, MenuGroup } from "@/models/menu"
  
  // 🌟 引入我們剛剛抽出的共用函數
  import { normalizePath } from "@/utils/readPath"

  export let rootItems: MenuItem[] = []
  export let initialItems: MenuItem[] | null = null
  export let currentPath = "" 

  export let onTitleChange: ((title: string) => void) | undefined = undefined
  export let onBackToRoot: (() => void) | undefined
  export let onClose: (() => void) | undefined

  let stack: MenuItem[][] = []
  let items: MenuItem[] = [] 
  let direction = 1 

  // --- 初始化邏輯 (Deep Linking) ---
  
  function findPathStack(
    currentItems: MenuItem[], 
    targetPath: string, 
    currentStack: MenuItem[][]
  ): { found: boolean, stack: MenuItem[][], finalItems: MenuItem[] } {
    
    // 🌟 將目標路徑正規化
    const normalizedTarget = normalizePath(targetPath);

    for (const item of currentItems) {
      // 🌟 將每個選單項目的路徑也正規化，確保精準比對
      if (item.type === 'page' && normalizePath(item.href) === normalizedTarget) {
        return { found: true, stack: currentStack, finalItems: currentItems }
      }

      if (item.type === 'group') {
        const result = findPathStack(
          item.children, 
          targetPath, 
          [...currentStack, currentItems] 
        )
        if (result.found) {
          return result
        }
      }
    }
    return { found: false, stack: [], finalItems: [] }
  }

  function init() {
    const baseItems = initialItems ?? rootItems
    
    if (currentPath && currentPath !== '/') {
      const { found, stack: newStack, finalItems } = findPathStack(baseItems, currentPath, [])
      
      if (found) {
        stack = newStack
        items = finalItems
      } else {
        items = baseItems
      }
    } else {
      items = baseItems
    }
  }

  init()

  // ------------------------------

  function isGroup(item: MenuItem): item is MenuGroup {
    return item.type === "group"
  }

  function enterGroup(item: MenuGroup) {
    onTitleChange?.(item.title)
    direction = 1
    stack = [...stack, items]
    items = item.children
  }

  function back() {
    if (stack.length === 0) {
      onBackToRoot?.()
      return
    }

    direction = -1
    items = stack[stack.length - 1]
    stack = stack.slice(0, -1)
    onTitleChange?.("")
  }

  function scrollToActive(node: HTMLElement, isActive: boolean) {
    if (isActive) {
      setTimeout(() => {
        node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 250);
    }
    
    return {
      update(newIsActive: boolean) {
        if (newIsActive) {
          setTimeout(() => {
            node.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 250);
        }
      }
    }
  }

  // 為了在 Template 方便使用，我們先計算正規化後的當前路徑
  $: normalizedCurrentPath = normalizePath(currentPath);
</script>

<div class="relative w-full grid grid-cols-1 grid-rows-1 transition-all duration-300 ease-out">
  {#key items}
    <ul
      class="menu menu-vertical w-full col-start-1 row-start-1 p-0 gap-1"
      in:fly={{ x: direction * 20, duration: 300, easing: cubicOut }}
      out:fly={{ x: direction * -20, duration: 300, easing: cubicOut }}
    >
      {#if stack.length > 0}
        <li class="mb-2 border-b border-white/5 pb-2">
          <button
            class="flex items-center gap-3 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300 group"
            on:click={back}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1">
              <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd" />
            </svg>
            Back
          </button>
        </li>
      {/if}

      {#each items as item}
        <li>
          {#if isGroup(item)}
            <button
              class="group flex justify-between items-center w-full px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 active:scale-[0.98] transition-all duration-200"
              on:click={() => enterGroup(item)}
            >
              <span class="text-base font-medium tracking-wide">{item.title}</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-white/20 transition-all duration-300 group-hover:text-white group-hover:translate-x-1">
                <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
              </svg>
            </button>
          {:else}
            <a
              href={item.href}
              use:scrollToActive={normalizePath(item.href) === normalizedCurrentPath}
              class="group flex justify-between items-center w-full px-4 py-3 rounded-xl transition-all duration-200 {normalizePath(item.href) === normalizedCurrentPath ? 'bg-white/20 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'}"
              on:click={onClose} 
            >
              <span class="text-base tracking-wide">{item.title}</span>
            </a>
          {/if}
        </li>
      {/each}
    </ul>
  {/key}
</div>