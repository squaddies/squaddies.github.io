function showLoading() {
  const loadingElement = document.getElementById("loading");
  if (loadingElement) loadingElement.style.display = "flex";
}

function hideLoading() {
  const loadingElement = document.getElementById("loading");
  if (loadingElement) loadingElement.style.display = "none";
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

showLoading();

fetch(
  "https://6zbvtyc4yf4p42nerdhovqsn7m0xdkmy.lambda-url.eu-central-1.on.aws/squad/stats"
)
  .then((response) => response.json())
  .then((serverList) => {
    hideLoading();
    serverList.sort((a, b) => b.player_count - a.player_count);
    const container = document.getElementById("serverInfoContainer");
    if (!container) return;
    container.innerHTML = "";
    serverList.forEach((server) => {
      const div = document.createElement("div");
      div.className = "serverInfo";
      const roundTime = formatTime(server.round_time);
      let mapName, mode, layer;
      if (
        server.layer_name.includes("VAT_") ||
        server.layer_name.includes("JensensRange") ||
        server.layer_name.includes("HT_")
      ) {
        [mapName, layer] = server.layer_name.split("_");
        mode = "Training";
      } else {
        [mapName, mode, layer] = server.layer_name.split("_");
      }
      const mapNameCorrections = {
        Tallil: "Tallil+Outskirts",
        Sumari: "Sumari Bala",
      };
      if (mapNameCorrections[mapName]) mapName = mapNameCorrections[mapName];
      const layerString =
        mode && layer ? `${mode} ${layer}` : mode || layer || "";
      const squadmapsUrl = `https://squadmaps.com/map?name=${encodeURIComponent(
        mapName
      )}&layer=${encodeURIComponent(layerString)}`;
      div.innerHTML = `
                <p><strong class="heading">${server.server_full_name}</strong></p>
                <p><strong>Players:</strong> ${server.player_count} / ${server.max_players}</p>
                <p><strong>Queue:</strong> ${server.queue_count}</p>
                <p><strong>Current Layer:</strong> ${server.layer_name}</p>
                <p><strong>Next Layer:</strong> ${server.layer_name_next}</p>
                <p><strong>Game Mode:</strong> ${server.game_mode}</p>
                <p><strong>Team:</strong> ${server.team_one} vs ${server.team_two}</p>
                <p><strong>Round time:</strong> ${roundTime}</p>
                <div class="links">
                    <a href="${squadmapsUrl}" target="_blank" rel="noopener noreferrer">Squadmaps</a>
                </div>
            `;
      container.appendChild(div);
    });
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
    hideLoading();
    const container = document.getElementById("serverInfoContainer");
    if (container) {
      container.innerHTML =
        '<p class="error">Failed to load server data. Please try again later.</p>';
    }
  });
