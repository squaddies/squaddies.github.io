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

function getHiddenServers() {
  return JSON.parse(localStorage.getItem("hiddenServers") || "[]");
}

function setHiddenServers(hiddenServers) {
  localStorage.setItem("hiddenServers", JSON.stringify(hiddenServers));
}

function isServerHidden(server) {
  const hidden = getHiddenServers();
  return hidden.includes(server.server_full_name);
}

function hideServer(server) {
  const hidden = getHiddenServers();
  if (!hidden.includes(server.server_full_name)) {
    hidden.push(server.server_full_name);
    setHiddenServers(hidden);
  }
}

function unhideServer(server) {
  let hidden = getHiddenServers();
  hidden = hidden.filter((name) => name !== server.server_full_name);
  setHiddenServers(hidden);
}

function updateServerTiles(serverList) {
  const container = document.getElementById("serverInfoContainer");
  if (!container) return;
  container.innerHTML = "";
  const hiddenServers = getHiddenServers();
  const visibleServers = serverList.filter(
    (s) => !hiddenServers.includes(s.server_full_name)
  );
  const hiddenTiles = serverList.filter((s) =>
    hiddenServers.includes(s.server_full_name)
  );
  function createServerDiv(server, isHidden) {
    const div = document.createElement("div");
    div.className = "serverInfo" + (isHidden ? " hidden-server" : "");
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
                <p><strong class="heading">${
                  server.server_full_name
                }</strong></p>
                <p><strong>Players:</strong> ${server.player_count} / ${
      server.max_players
    }</p>
                <p><strong>Queue:</strong> ${server.queue_count}</p>
                <p><strong>Current Layer:</strong> ${server.layer_name}</p>
                <p><strong>Next Layer:</strong> ${server.layer_name_next}</p>
                <p><strong>Game Mode:</strong> ${server.game_mode}</p>
                <p><strong>Team:</strong> ${server.team_one} vs ${
      server.team_two
    }</p>
                <p><strong>Round time:</strong> ${roundTime}</p>
                <div class="links">
                    <a href="${squadmapsUrl}" class="squadmaps-btn" target="_blank" rel="noopener noreferrer">Squadmaps</a>
                    <button class="hide-btn">${
                      isHidden ? "Unhide" : "Hide"
                    }</button>
                </div>
            `;
    div.querySelector(".hide-btn").addEventListener("click", function () {
      if (isHidden) {
        unhideServer(server);
      } else {
        hideServer(server);
      }
      updateServerTiles(serverList);
    });
    return div;
  }
  visibleServers.forEach((server) => {
    container.appendChild(createServerDiv(server, false));
  });
  if (hiddenTiles.length > 0) {
    // No header, just append hidden tiles
    hiddenTiles.forEach((server) => {
      container.appendChild(createServerDiv(server, true));
    });
  }
}

fetch(
  "https://6zbvtyc4yf4p42nerdhovqsn7m0xdkmy.lambda-url.eu-central-1.on.aws/squad/stats"
)
  .then((response) => response.json())
  .then((serverList) => {
    hideLoading();
    serverList.sort((a, b) => b.player_count - a.player_count);
    updateServerTiles(serverList);
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
