<script>
  export let videoId;
  export let title = "YouTube video player";
  
  let isPlaying = false;
  
  $: posterUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  function playVideo() {
    isPlaying = true;
  }
</script>

<div class="video-container">
  {#if !isPlaying}
    <button 
      class="poster" 
      style="background-image: url({posterUrl})" 
      aria-label="Play video: {title}"
      on:click={playVideo}
    >
      <div class="play-button">
        <svg viewBox="0 0 24 24" width="64" height="64">
          <path fill="currentColor" d="M8 5v14l11-7z"/>
        </svg>
      </div>
    </button>
  {:else}
    <iframe
      src="https://www.youtube.com/embed/{videoId}?autoplay=1"
      {title}
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    ></iframe>
  {/if}
</div>

<style>
  .video-container {
    position: relative;
    width: 100%;
    /* 現代 CSS 直接用 aspect-ratio 處理 16:9，不用再寫 padding-bottom hack */
    aspect-ratio: 16 / 9; 
    background-color: #000;
    border-radius: 12px; /* 圓角更美觀 */
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .poster {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    border: none;
    cursor: pointer;
    position: relative;
    transition: transform 0.3s;
  }

  /* 滑鼠懸停時微微放大封面，增加互動感 */
  .poster:hover {
    transform: scale(1.02);
  }

  /* 增加一層黑色漸層讓白色播放鈕更明顯 */
  .poster::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.2);
    transition: background 0.3s;
  }
  
  .poster:hover::before {
    background: rgba(0,0,0,0.1);
  }

  .play-button {
    position: relative;
    z-index: 2;
    color: white;
    background: rgba(255, 0, 0, 0.9); /* YouTube 紅 */
    border-radius: 50%;
    width: 68px;
    height: 68px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 20px rgba(0,0,0,0.4);
    transition: transform 0.2s, background 0.2s;
  }

  .poster:hover .play-button {
    transform: scale(1.1);
    background: red;
  }

  iframe {
    width: 100%;
    height: 100%;
  }
</style>