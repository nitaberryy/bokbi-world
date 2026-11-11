/* ==================================
   BOKBI WORLD — VIDEO ARCHIVE
================================== */

const archiveContainer = document.getElementById("videoGrid");
const yearContainer = document.getElementById("yearFilters");
const searchInput = document.getElementById("archiveSearch");
const monthFilter = document.getElementById("monthFilter");
const categoryFilter = document.getElementById("categoryFilter");
const artistFilter = document.getElementById("artistFilter");

let videos = [];
let selectedYear = "all";

const availableYears = [
    2019, 2020, 2021, 2022,
    2023, 2024, 2025, 2026
];

const months = [
    "January", "February", "March",
    "April", "May", "June",
    "July", "August", "September",
    "October", "November", "December"
];

function getYouTubeID(url) {
    try {
        const parsed = new URL(url);

        if (parsed.hostname.includes("youtu.be")) {
            return parsed.pathname.slice(1);
        }

        if (parsed.hostname.includes("youtube.com")) {
            if (parsed.pathname === "/watch") {
                return parsed.searchParams.get("v");
            }

            const match = parsed.pathname.match(
                /\/(embed|shorts)\/([^/?]+)/
            );

            return match ? match[2] : null;
        }
    } catch {
        return null;
    }

    return null;
}

/* LOAD VIDEO DATABASE */

async function loadVideos() {
    try {
        const response = await fetch("../data/videos.json");

        if (!response.ok) {
            throw new Error("Unable to load archive database.");
        }

        const data = await response.json();

        videos = Array.isArray(data.videos)
            ? data.videos
            : [];

        createYearButtons();
        displayVideos();

    } catch (error) {
        console.error(error);

        archiveContainer.innerHTML = `
            <div class="empty-state">
                <h3>Something went wrong ♡</h3>
                <p>We couldn't load the archive. Please try again later.</p>
            </div>
        `;
    }
}

/* YEAR BUTTONS */

function createYearButtons() {

    yearContainer.innerHTML = `
        <button class="year-button active"
            data-year="all">
            All Years
        </button>
    `;

    availableYears.forEach(year => {

        const button = document.createElement("button");

        button.className = "year-button";
        button.dataset.year = year;
        button.textContent = year;

        yearContainer.appendChild(button);

    });

    yearContainer.querySelectorAll("button").forEach(button => {

        button.addEventListener("click", () => {

            yearContainer.querySelectorAll("button")
                .forEach(btn => btn.classList.remove("active"));

            button.classList.add("active");

            selectedYear = button.dataset.year;

            displayVideos();

        });

    });
}

/* DISPLAY VIDEOS */

function displayVideos() {

    const search = searchInput.value.toLowerCase();
    const month = monthFilter.value;
    const category = categoryFilter.value;
    const artist = artistFilter.value;

    const filteredVideos = videos.filter(video => {

        const date = new Date(video.date + "T00:00:00");

        const matchesYear =
            selectedYear === "all" ||
            date.getFullYear() === Number(selectedYear);

        const matchesMonth =
            month === "all" ||
            date.getMonth() === Number(month);

        const matchesCategory =
            category === "all" ||
            video.category === category;

        const matchesArtist =
            artist === "all" ||
            video.artist === artist;

        const matchesSearch = [
            video.title,
            video.description,
            video.category,
            video.artist,
            video.creator,
            ...(video.tags || [])
        ]
        .join(" ")
        .toLowerCase()
        .includes(search);

        return matchesYear &&
            matchesMonth &&
            matchesCategory &&
            matchesArtist &&
            matchesSearch;
    });

    filteredVideos.sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    archiveContainer.innerHTML = "";

    if (filteredVideos.length === 0) {

        archiveContainer.innerHTML = `
            <div class="empty-state">
                <h3>No memories found ♡</h3>
                <p>
                    We haven't added videos matching
                    your search yet.
                    <br>
                    Check back soon!
                </p>
            </div>
        `;

        return;
    }

    filteredVideos.forEach(video => {

        const card = document.createElement("article");

        card.className = "video-card";

        const youtubeID = video.platform === "YouTube"
            ? getYouTubeID(video.url)
            : null;

        const thumbnail = video.thumbnail ||
            (youtubeID
                ? `https://img.youtube.com/vi/${youtubeID}/hqdefault.jpg`
                : "");

        const image = thumbnail
            ? `<img src="${thumbnail}" alt="${video.title}"
                 loading="lazy">`
            : `<span>♡ BOKBI WORLD</span>`;

        const formattedDate = new Date(
            video.date + "T00:00:00"
        ).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });

        card.innerHTML = `
            <div class="video-thumbnail">
                ${image}
            </div>

            <div class="video-info">

                <small>
                    ${(video.category || "OTHER").toUpperCase()}
                    ·
                    ${(video.artist || "GeminiFourth")}
                </small>

                <h3>${escapeHTML(video.title)}</h3>

                <p>${escapeHTML(video.description || "")}</p>

                <p>📅 ${formattedDate}</p>

                <a class="video-link"
                   href="${safeURL(video.url)}"
                   target="_blank"
                   rel="noopener noreferrer">
                    Watch original video ↗
                </a>

            </div>
        `;

        archiveContainer.appendChild(card);

    });

}

/* BASIC OUTPUT PROTECTION */

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function safeURL(value = "") {
    try {
        const url = new URL(value);

        if (url.protocol === "https:" &&
            ["youtube.com", "www.youtube.com",
             "youtu.be", "www.youtube-nocookie.com",
             "x.com", "www.x.com",
             "twitter.com", "www.twitter.com"]
                .includes(url.hostname)) {
            return url.href;
        }
    } catch {
        return "#";
    }

    return "#";
}

/* FILTER EVENTS */

searchInput.addEventListener("input", displayVideos);
monthFilter.addEventListener("change", displayVideos);
categoryFilter.addEventListener("change", displayVideos);
artistFilter.addEventListener("change", displayVideos);

/* START ARCHIVE */

loadVideos();
