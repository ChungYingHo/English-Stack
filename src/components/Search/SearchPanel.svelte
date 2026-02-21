<script lang="ts">
  import { onMount } from "svelte";

  export let onClose: () => void; 
  
  let errorMsg = "";

  onMount(() => {
    // 1. 定義同步事件
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".pagefind-ui__result-link")) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    const container = document.getElementById("pagefind-search");
    container?.addEventListener("click", handleClick);

    // 2. 初始化 Pagefind
    const initPagefind = async () => {
      if (!(window as any).PagefindUI) {
        try {
          await loadScript("/pagefind/pagefind-ui.js");
        } catch (e) {
          try {
             await loadScript("/_pagefind/pagefind-ui.js");
          } catch (e2) {
             console.error("Pagefind script load error:", e2);
             errorMsg = "無法載入搜尋引擎。請確認已執行 npm run build。";
             return;
          }
        }
      }

      const PagefindUI = (window as any).PagefindUI;
      if (PagefindUI) {
        try {
          new PagefindUI({
            element: "#pagefind-search",
            showImages: false,
            showSubResults: true,
            excerptLength: 15,
            baseUrl: "/", 
            translations: {
              placeholder: "Search...",
              zero_results: "No results found",
              clear_search: "Clear" 
            }
          });

          const input = document.querySelector(".pagefind-ui__search-input") as HTMLInputElement;
          if (input) {
            input.focus();
            input.addEventListener('click', (e) => e.stopPropagation());
          }
        } catch (e) {
          console.error("Pagefind init error:", e);
        }
      }
    };

    initPagefind();

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      container?.removeEventListener("click", handleClick);
    };
  });

  function loadScript(src: string) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error(`Script load error for ${src}`));
      document.body.appendChild(script);
    });
  }
</script>

<div class="flex flex-col h-full text-left relative bg-[#161213]">
  <div class="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-white/5 bg-[#161213] shrink-0">
    <div class="flex items-center gap-2 md:gap-3 text-white/60">
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <span class="text-xs font-mono font-bold uppercase tracking-[0.15em]">Global Search</span>
    </div>
    <div class="flex items-center gap-2">
       <span class="text-[10px] font-mono text-white/20 hidden md:inline-block">ESC to close</span>
       <button on:click={onClose} class="md:hidden text-white/40 p-1 min-w-[32px] min-h-[32px] flex items-center justify-center">✕</button>
    </div>
  </div>

  <div class="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1 relative z-10">
    {#if errorMsg}
        <div class="text-red-400 text-xs text-center mt-10 p-4 border border-red-500/20 rounded bg-red-500/5">
          {errorMsg}
        </div>
    {/if}
    
    <div id="pagefind-search" class="w-full pagefind-ui"></div>
  </div>
</div>

<style>
  :global(:root) {
    --pagefind-ui-scale: 0.85;
    --pagefind-ui-primary: #f472b6; 
    --pagefind-ui-text: #cbd5e1;
    --pagefind-ui-background: #161213;
    --pagefind-ui-border: #334155;
    --pagefind-ui-tag: #f472b6;
    --pagefind-ui-border-width: 1px;
    --pagefind-ui-border-radius: 8px;
    --pagefind-ui-font: 'Inter', system-ui, sans-serif;
  }

  /* 1. Form 容器修正：
       - position: relative (為了讓按鈕定位)
       - flex-direction: column (關鍵！讓 Input 和 結果 垂直排列，不會左右擠壓)
  */
  :global(.pagefind-ui__form) {
    position: relative !important;
    display: flex !important; 
    flex-direction: column !important; /* [修正] 垂直排列，解決 Input 被壓扁的問題 */
    width: 100% !important;
  }

  :global(.pagefind-ui__form::before),
  :global(.pagefind-ui__form::after) { display: none !important; }

  /* 2. 輸入框設定 */
  :global(.pagefind-ui__search-input) {
    width: 100% !important;
    background-color: rgba(255,255,255,0.03) !important;
    border: 1px solid rgba(255,255,255,0.08) !important;
    color: white !important;
    
    /* 預留右側空間給按鈕 */
    padding: 14px 16px !important;
    padding-right: 60px !important; 

    font-size: 16px !important;
    font-weight: 500 !important;
    border-radius: 12px !important;
    transition: all 0.2s ease !important;
    box-sizing: border-box !important;
    
    /* 固定高度：手機 50px */
    height: 50px !important;
  }
  
  @media (min-width: 768px) {
    :global(.pagefind-ui__search-input) {
      padding: 18px 22px !important;
      padding-right: 70px !important; 
      font-size: 1.1rem !important; 
      /* 固定高度：電腦 60px */
      height: 60px !important;
    }
  }

  :global(.pagefind-ui__search-input:focus) {
    background-color: rgba(255,255,255,0.06) !important;
    border-color: var(--pagefind-ui-primary) !important;
    outline: none;
    box-shadow: 0 0 0 1px rgba(244, 114, 182, 0.4), 0 0 20px rgba(244, 114, 182, 0.15) !important;
  }

  /* 3. 清除按鈕定位 [關鍵修正]：
       - 不使用 top: 50% (因為結果出現後 form 會變高，50% 會跑到下面去)
       - 改用 top: 25px / 30px (精準鎖定在 Input 高度的一半位置)
  */
  :global(.pagefind-ui__search-clear) {
    position: absolute !important;
    right: 10px !important;
    z-index: 20 !important;
    
    /* 手機版：Input 高 50px -> Top 25px */
    top: 25px !important; 
    transform: translateY(-50%) !important;
    
    background: transparent !important;
    color: #64748b !important;
    padding: 4px 8px !important;
    margin: 0 !important;
    
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    
    font-size: 13px !important;
    cursor: pointer !important;
    border-radius: 4px !important;
  }

  @media (min-width: 768px) {
    :global(.pagefind-ui__search-clear) {
      /* 電腦版：Input 高 60px -> Top 30px */
      top: 30px !important; 
    }
  }
  
  :global(.pagefind-ui__search-clear:hover) {
    color: #f472b6 !important;
    background: rgba(255,255,255,0.05) !important;
  }

  /* 4. 結果列表 */
  :global(.pagefind-ui__drawer) { 
    gap: 12px !important; 
    padding-top: 16px !important;
    width: 100% !important; /* 確保佔滿寬度 */
  }

  :global(.pagefind-ui__result) {
    border: 1px solid transparent !important;
    padding: 12px !important;
    border-radius: 8px !important;
    background: transparent !important;
    transition: background-color 0.2s ease;
  }

  @media (min-width: 768px) {
    :global(.pagefind-ui__result) {
      padding: 16px !important;
      border-radius: 12px !important;
    }
  }

  :global(.pagefind-ui__result:hover) {
    background-color: rgba(255,255,255,0.03) !important;
    border-color: rgba(255,255,255,0.05) !important;
  }

  :global(.pagefind-ui__result-thumb) { display: none; }

  :global(.pagefind-ui__result-link) {
    color: #f472b6 !important;
    font-weight: 600 !important;
    font-size: 1rem !important;
    text-decoration: none !important;
    display: block !important;
    margin-bottom: 4px !important;
    line-height: 1.4 !important;
    word-break: break-word !important; 
  }
  
  @media (min-width: 768px) {
    :global(.pagefind-ui__result-link) {
      font-size: 1.1rem !important;
      margin-bottom: 6px !important;
    }
  }
  
  /* 5. 摘要與 line-clamp */
  :global(.pagefind-ui__result-excerpt) {
    color: #94a3b8 !important;
    font-size: 0.85rem !important;
    line-height: 1.5 !important;
    font-weight: 400 !important;
    
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2; 
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word !important;
  }

  @media (min-width: 768px) {
    :global(.pagefind-ui__result-excerpt) {
      font-size: 0.9rem !important;
      line-height: 1.6 !important;
      -webkit-line-clamp: 3;
      line-clamp: 3;
    }
  }
  
  :global(.pagefind-ui__result-excerpt mark) {
    background: rgba(244, 114, 182, 0.15) !important;
    color: #fce7f3 !important;
    font-weight: 600 !important;
    padding: 0 3px;
    border-radius: 3px;
  }

  :global(.pagefind-ui__message) {
      color: #64748b !important;
      padding: 10px 4px !important;
      font-size: 0.9rem !important;
  }
</style>