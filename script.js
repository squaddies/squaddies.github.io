// Function to show the loading element
function showLoading() {
    const loadingElement = document.getElementById("loading");
    loadingElement.style.display = "flex";
}

// Function to hide the loading element
function hideLoading() {
    const loadingElement = document.getElementById("loading");
    loadingElement.style.display = "none";
}

// Function to format time
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${remainingMinutes}m`;
}

// Show loading animation when the page loads
showLoading();

// Fetch data with loading animation
fetch("https://zljh3a5dwxmhvne7xoydlveihq0uptue.lambda-url.eu-central-1.on.aws/merged.json")
    .then((response) => response.json())
    .then((jsonData) => {
        // Hide the loading animation when data is loaded
        hideLoading();

        jsonData.sort((a, b) => b.player_count - a.player_count);

        const serverInfoContainer = document.getElementById("serverInfoContainer");

        jsonData.forEach((data) => {
            const div = document.createElement("div");
            div.classList.add("serverInfo");

            const roundTimeFormatted = formatTime(data.round_time);

            div.innerHTML = `
                <p><strong class="heading">${data.server_full_name}</strong></p>
                <p><strong>Players:</strong> ${data.player_count} / ${data.max_players}</p>
                <p><strong>Queue: </strong> ${data.queue_count}</p>
                <p><strong>Current Layer:</strong> ${data.layer_name}</p>
                <p><strong>Next Layer:</strong> ${data.layer_name_next}</p>
                <p><strong>Game Mode:</strong> ${data.game_mode}</p>
                <p><strong>Team:</strong> ${data.team_one} vs ${data.team_two}</p>
                <p><strong>Round time:</strong> ${roundTimeFormatted}</p>
            `;

            if (data.layer_name.includes("VAT_") || data.layer_name.includes("JensensRange") || data.layer_name.includes("HT_")) {
                map_name = data.layer_name.split("_")[0];
                layer = data.layer_name.split("_")[1];
                mode = "Training";
            } else {
                map_name = data.layer_name.split("_")[0];
                mode = data.layer_name.split("_")[1];
                layer = data.layer_name.split("_")[2];
            }

            squadmaps = `http://squadmaps.com/#${map_name}`;

            if (map_name === "Tallil") {
                map_name = "Tallil+Outskirts";
            }

            squadlanes = `https://squadlanes.com/#map=${map_name}&layer=${mode}+${layer}`;

            if (data.game_mode !== "AAS" && data.game_mode !== "Seed") {
                div.innerHTML += `<p><strong><a href="${squadlanes}" target="_blank">Squadlanes</strong></p>`;
            }

            div.innerHTML += `<p><strong><a href="${squadmaps}" target="_blank">Squadmaps</a></strong></p>`;
            serverInfoContainer.appendChild(div);
        });
    })
    .catch((error) => {
        console.error("Error fetching data:", error);
        // Hide the loading animation in case of an error
        hideLoading();
    });
