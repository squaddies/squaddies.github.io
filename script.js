function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.floor(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
}

fetch("https://sqds.s3.eu-central-1.amazonaws.com/merged.json")
    .then((response) => response.json())
    .then((jsonData) => {
        jsonData.sort((a, b) => b.player_count - a.player_count);

        const serverInfoContainer = document.getElementById("serverInfoContainer");

        jsonData.forEach((data) => {
            const div = document.createElement("div");
            div.classList.add("serverInfo");

            const roundTimeFormatted = formatTime(data.round_time);

            div.innerHTML = `
                <p><strong class=heading>${data.server_full_name}</strong></p>
                <p><strong>Players:</strong> ${data.player_count} / ${data.max_players}</p>
                <p><strong>Queue: </strong> ${data.queue_count}</p>
                <p><strong>Current Layer:</strong> ${data.layer_name}</p>
                <p><strong>Next Layer:</strong> ${data.layer_name_next}</p>
                <p><strong>Game Mode:</strong> ${data.game_mode}</p>
                <p><strong>Team:</strong> ${data.team_one} vs ${data.team_two}</p>
                <p><strong>Round time:</strong> ${roundTimeFormatted}</p>
            `;

            if (data.game_mode !== "AAS" && data.game_mode !== "Seed") {
                div.innerHTML += `<p><strong><a href="${data.squadlanes}" target="_blank">Squadlanes</strong></p>`;
            }

            div.innerHTML += `<p><strong><a href="${data.squadmaps}" target="_blank">Squadmaps</a></strong></p>`;
            serverInfoContainer.appendChild(div);
        });
    })
    .catch((error) => {
        console.error("Error fetching data:", error);
    });
