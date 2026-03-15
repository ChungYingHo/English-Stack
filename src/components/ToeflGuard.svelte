<script lang="ts">
  import { onMount } from 'svelte'

  const PASSWORD = 'toefl2026'
  const STORAGE_KEY = 'toefl_auth'

  // Optional: called after successful auth (used when triggered from menu)
  export let onSuccess: (() => void) | undefined = undefined

  let visible = $state(false)
  let input = $state('')
  let error = $state(false)

  onMount(() => {
    if (sessionStorage.getItem(STORAGE_KEY) !== PASSWORD) {
      visible = true
    }
  })

  function submit() {
    if (input === PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, PASSWORD)
      visible = false
      onSuccess?.()
    } else {
      error = true
      input = ''
      setTimeout(() => (error = false), 1500)
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') submit()
  }
</script>

{#if visible}
  <div class="guard-overlay">
    <div class="guard-card" class:shake={error}>
      <div class="lock-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      <h2>TOEFL Content</h2>
      <p>此區域僅限授權用戶瀏覽，請輸入密碼繼續。</p>
      <input
        type="password"
        placeholder="Enter password"
        bind:value={input}
        onkeydown={onKeydown}
        class:error-input={error}
        autofocus
      />
      {#if error}
        <p class="error-msg">密碼錯誤，請再試一次。</p>
      {/if}
      <button onclick={submit}>進入</button>
    </div>
  </div>
{/if}

<style>
  .guard-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .guard-card {
    background: #ffffff;
    border-radius: 1.5rem;
    padding: 2.5rem 2rem;
    width: 100%;
    max-width: 360px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
    animation: pop-in 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .lock-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #e0e7ff;
    color: #4f46e5;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.5rem;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 800;
    color: #0f172a;
    margin: 0;
  }

  p {
    font-size: 0.9rem;
    color: #64748b;
    text-align: center;
    margin: 0;
    line-height: 1.6;
  }

  input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }

  input:focus {
    border-color: #6366f1;
  }

  input.error-input {
    border-color: #ef4444;
  }

  .error-msg {
    color: #ef4444;
    font-size: 0.8rem;
    margin: -0.5rem 0 0;
  }

  button {
    width: 100%;
    padding: 0.75rem;
    background: #4f46e5;
    color: #fff;
    border: none;
    border-radius: 0.75rem;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
  }

  button:hover {
    background: #4338ca;
  }

  button:active {
    transform: scale(0.98);
  }

  .shake {
    animation: shake 0.4s ease;
  }

  @keyframes pop-in {
    from { opacity: 0; transform: scale(0.9) translateY(20px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-6px); }
    80% { transform: translateX(6px); }
  }
</style>
