async function fetchLeaderboardData() {
	try {
		const response = await fetch("http://127.0.0.1:3000/loserboard");
		const data = await response.json();
		console.log("Données fetchées : ", data);
		return data;
	} catch (error) {
		console.error("Error fetching leaderboard data:", error);
		return [];
	}
}

function renderLeaderboardData(data) {
	const tableBody = document.querySelector("#leaderboard-table tbody");
	tableBody.innerHTML = ""; // Clear existing content
	console.log("Voici les données fetch : ");
	console.log(data);
	data.forEach((item, index) => {
		const row = document.createElement("tr");
		row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${item.time}s</td>
			<td>${item.deaths}</td>


        `;
		tableBody.appendChild(row);
	});
}

document.addEventListener("DOMContentLoaded", async () => {
	const leaderboardData = await fetchLeaderboardData();
	renderLeaderboardData(leaderboardData);
});
