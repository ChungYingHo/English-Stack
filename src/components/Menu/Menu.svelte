<script lang="ts">
  import { onMount } from 'svelte'
  import type { MenuItem, MenuGroup } from '@/models/menu'
  import DrilldownMenu from '@/components/Menu/components/DrilldownMenu.svelte'
  import SearchBtn from '@/components/Search/SearchBtn.svelte'
  import SearchPanel from '@/components/Search/SearchPanel.svelte'
  import ToeflGuard from '@/components/ToeflGuard.svelte'
  import { fade, slide } from 'svelte/transition'

  import { normalizePath } from '@/utils/readPath'
  import { isToeflAuthenticated } from '@/constants/toefl'

  export let rootItems: MenuItem[] = []
  export let currentPath = ''

  let desktopOpenGroup: MenuGroup | null = null
  let desktopTitle = ''

  let innerWidth = 0
  let isSearchOpen = false
  let isMobileMenuOpen = false

  // 捲動狀態：scrolled 控制底色強度、showMenu 控制顯示/隱藏
  let scrolled = false
  let showMenu = true
  let prevScrollY = 0

  let showToeflGuard = false
  let pendingToeflAction: (() => void) | null = null

  // 任一面板開啟時導覽列固定顯示
  $: panelOpen = !!desktopOpenGroup || isMobileMenuOpen || isSearchOpen
  $: if (panelOpen) showMenu = true

  function toeflGate(action: () => void) {
    if (isToeflAuthenticated()) {
      action()
    } else {
      pendingToeflAction = action
      showToeflGuard = true
    }
  }

  function onToeflSuccess() {
    showToeflGuard = false
    pendingToeflAction?.()
    pendingToeflAction = null
  }

  function onToeflDismiss() {
    showToeflGuard = false
    pendingToeflAction = null
  }

  function handleScroll() {
    const y = window.scrollY
    scrolled = y > 12
    // 接近頂端或面板開啟時固定顯示；否則向下捲動隱藏、向上捲動顯示，
    // 8px 門檻可避免細微抖動造成的閃爍。
    if (panelOpen || y < 80) {
      showMenu = true
    } else if (Math.abs(y - prevScrollY) > 8) {
      showMenu = y < prevScrollY
    }
    prevScrollY = y
  }

  function isGroup(menuItem: MenuItem): menuItem is MenuGroup {
    return menuItem.type === 'group'
  }

  function groupContainsPath(group: MenuGroup, targetPath: string): boolean {
    const normalizedTarget = normalizePath(targetPath)
    return group.children.some(child => {
      if (child.type === 'page') {
        const childHref = normalizePath(child.href)
        return childHref === normalizedTarget || (childHref !== '/' && normalizedTarget.startsWith(childHref + '/'))
      }
      if (child.type === 'group') {
        return groupContainsPath(child, targetPath)
      }
      return false
    })
  }

  function isActive(item: MenuItem): boolean {
    if (innerWidth >= 1024 && desktopOpenGroup === item) return true

    const normalizedTarget = normalizePath(currentPath)
    if (isGroup(item)) {
      return groupContainsPath(item, currentPath)
    }

    if (item.type === 'page') {
      const itemHref = normalizePath(item.href)
      return itemHref === normalizedTarget || (itemHref !== '/' && normalizedTarget.startsWith(itemHref + '/'))
    }

    return false
  }

  function getActiveGroup(): MenuGroup | null {
    for (const item of rootItems) {
      if (isGroup(item) && groupContainsPath(item, currentPath)) {
        return item
      }
    }
    return null
  }

  function openDesktopGroup(menuGroup: MenuGroup) {
    if (innerWidth < 1024) return
    if (desktopOpenGroup && desktopOpenGroup.title === menuGroup.title) {
      closeAll()
      return
    }
    closeAll()
    desktopOpenGroup = menuGroup
    desktopTitle = menuGroup.title
  }

  function handleLogoClick(e: MouseEvent) {
    if (innerWidth < 1024) {
      e.preventDefault()
      isMobileMenuOpen ? closeAll() : openMobileMenu()
    }
  }

  function openMobileMenu() {
    closeAll()
    isMobileMenuOpen = true
    const activeGroup = getActiveGroup()
    desktopTitle = activeGroup ? activeGroup.title : 'MENU'
  }

  function closeAll() {
    desktopOpenGroup = null
    isMobileMenuOpen = false
    isSearchOpen = false
    desktopTitle = ''
  }

  function toggleSearch() {
    isSearchOpen ? closeAll() : (closeAll(), isSearchOpen = true)
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    closeAll()
  }

  function onWindowKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && panelOpen) closeAll()
  }

  onMount(() => {
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  })
</script>

<svelte:window bind:innerWidth on:keydown={onWindowKeydown} />

<header
  class="
    fixed top-0 left-0 right-0 z-50 mt-6 pointer-events-none
    transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none
    {showMenu ? 'translate-y-0' : '-translate-y-[200%]'}
  "
>
  <nav
    aria-label="Primary"
    class="
      pointer-events-auto mx-auto w-fit flex justify-center items-center px-3 py-2 lg:pl-3 lg:pr-4 relative
      border rounded-full transition-all duration-300 ease-out
      {scrolled
        ? 'bg-white/95 backdrop-blur-xl border-slate-200/80 shadow-lg shadow-slate-900/5'
        : 'bg-white/70 backdrop-blur-xl border-white/60 shadow-sm'}
    "
  >
    <div class="flex w-auto justify-center items-center gap-2 lg:gap-4 relative">
      <a
        href="/"
        on:click={handleLogoClick}
        aria-label={innerWidth < 1024 ? (isMobileMenuOpen ? 'Close menu' : 'Open menu') : 'English Stack — home'}
        aria-haspopup={innerWidth < 1024 ? 'menu' : undefined}
        aria-expanded={innerWidth < 1024 ? isMobileMenuOpen : undefined}
        class="
          group relative flex items-center gap-2 h-10 px-5 lg:px-8 rounded-full
          bg-slate-50 border border-slate-200
          hover:border-indigo-300 hover:bg-indigo-50/50
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1
          transition-all duration-300 ease-out active:scale-[0.98] z-20
        "
      >
        <span class="
          text-xs md:text-sm font-bold tracking-[0.15em] lg:tracking-[0.2em] whitespace-nowrap
          text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600
        ">
          ENGLISH STACK
        </span>
        <svg
          class="lg:hidden w-3.5 h-3.5 text-slate-400 transition-transform duration-300 {isMobileMenuOpen ? 'rotate-180' : ''}"
          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </a>

      <ul class="hidden lg:flex menu menu-horizontal bg-transparent px-1 gap-2">
        {#each rootItems as menuItem (menuItem.title)}
          {#if isGroup(menuItem)}
            <li>
              <button
                aria-haspopup="menu"
                aria-expanded={desktopOpenGroup === menuItem}
                class="
                  h-10 px-4 rounded-full text-base font-medium tracking-wide
                  flex items-center gap-1.5 transition-all duration-300
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
                  {isActive(menuItem)
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'}
                "
                on:click={() => openDesktopGroup(menuItem)}
              >
                {menuItem.title}
                <svg
                  class="w-3.5 h-3.5 opacity-60 transition-transform duration-300 {desktopOpenGroup === menuItem ? 'rotate-180' : ''}"
                  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </li>
          {:else}
            <li>
              <a
                href={menuItem.href}
                aria-current={isActive(menuItem) ? 'page' : undefined}
                class="
                  h-10 px-5 rounded-full text-base font-medium tracking-wide transition-all duration-300 flex items-center
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
                  {isActive(menuItem)
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'}
                "
              >
                {menuItem.title}
              </a>
            </li>
          {/if}
        {/each}
      </ul>

      <div class="flex items-center gap-1 lg:gap-3 lg:pl-1">
        <div class="hidden lg:block w-px h-5 bg-slate-200"></div>
        <SearchBtn onClick={toggleSearch} isOpen={isSearchOpen} />
      </div>
    </div>

    {#if (desktopOpenGroup && innerWidth >= 1024) || (isMobileMenuOpen && innerWidth < 1024)}
      <div
        class="
          absolute top-full pt-4 z-50
          w-[calc(100vw-32px)] max-w-[320px]
          md:w-[600px] md:max-w-[600px]
          left-1/2 -translate-x-1/2
          lg:w-full lg:max-w-none lg:left-0 lg:translate-x-0
        "
        transition:fade={{ duration: 120 }}
      >
        <div
          class="
            bg-white border border-slate-200 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-2xl
            p-2.5 lg:p-2 text-xs
            max-h-[60vh] lg:max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar
          "
          transition:slide={{ duration: 250, axis: 'y' }}
        >
          <div class="flex items-center justify-between mb-1 px-2 pt-1 pb-1.5 border-b border-slate-100 sticky top-0 bg-white z-10">
             {#key desktopTitle}
              <div class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1" in:fade={{ duration: 150 }}>
                {desktopTitle}
              </div>
             {/key}
            <button class="btn btn-ghost btn-xs btn-circle w-6 h-6 min-h-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-colors flex items-center justify-center" aria-label="Close menu" on:click={closeAll}>✕</button>
          </div>

          {#if innerWidth < 1024}
            <div class="mb-2">
              <a
                href="/"
                on:click={closeAll}
                class="
                  flex items-center gap-3 px-3 py-3 rounded-lg w-full
                  text-slate-700 font-bold tracking-widest uppercase
                  hover:bg-slate-50 hover:text-indigo-600 transition-all duration-200
                "
              >
                <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-indigo-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <span>HOME</span>
              </a>
              <div class="h-px bg-slate-100 mx-2 mt-1"></div>
            </div>
          {/if}

          {#key (isMobileMenuOpen ? 'mobile-root' : desktopOpenGroup?.title)}
            <DrilldownMenu
              rootItems={rootItems}
              initialItems={isMobileMenuOpen ? rootItems : (desktopOpenGroup?.children || [])}
              currentPath={currentPath}
              onBackToRoot={() => { if (!isMobileMenuOpen) closeAll() }}
              onClose={closeAll}
              onTitleChange={(title) => {
                if (title) {
                  desktopTitle = title
                } else {
                  desktopTitle = isMobileMenuOpen ? 'MENU' : (desktopOpenGroup?.title || '')
                }
              }}
              {toeflGate}
            />
          {/key}

          {#if innerWidth < 1024}
            <div class="mt-2 pt-2 border-t border-slate-100">
              <button
                on:click={scrollToTop}
                class="
                  flex items-center justify-center gap-2 px-3 py-3 rounded-lg w-full
                  text-slate-500 font-bold tracking-widest uppercase text-[10px]
                  hover:bg-slate-50 hover:text-indigo-600 transition-all duration-200
                "
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m18 15-6-6-6 6" />
                </svg>
                <span>Back to Top</span>
              </button>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    {#if isSearchOpen}
      <div
        class="
          absolute top-full pt-4 z-50
          w-[calc(100vw-32px)] max-w-[320px]
          md:w-[600px] md:max-w-[600px]
          left-1/2 -translate-x-1/2
          lg:w-full lg:max-w-none lg:left-0 lg:translate-x-0
        "
        transition:fade={{ duration: 120 }}
      >
        <div
          class="
            bg-white border border-slate-200 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-2xl
            p-2.5 lg:p-0 text-xs
            max-h-[60vh] lg:max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar
          "
          transition:slide={{ duration: 250, axis: 'y' }}
        >
          <SearchPanel onClose={closeAll} />
        </div>
      </div>
    {/if}

  </nav>
</header>

{#if (desktopOpenGroup && innerWidth >= 1024) || isMobileMenuOpen || isSearchOpen}
  <button
    class="fixed inset-0 z-40 cursor-default focus:outline-none"
    aria-label="Close panel"
    on:click={closeAll}
  ></button>
{/if}

{#if showToeflGuard}
  <ToeflGuard onSuccess={onToeflSuccess} onDismiss={onToeflDismiss} />
{/if}

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.2); /* Indigo-500 with opacity */
    border-radius: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(99, 102, 241, 0.4);
  }
</style>
