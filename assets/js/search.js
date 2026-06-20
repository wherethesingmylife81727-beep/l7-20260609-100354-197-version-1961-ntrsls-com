(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                """: "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function card(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class="movie-card">" +
            "<a class="poster-link" href="" + escapeHtml(movie.href) + "" aria-label="" + escapeHtml(movie.title) + "">" +
            "<figure class="poster">" +
            "<img loading="lazy" src="" + escapeHtml(movie.cover) + "" alt="" + escapeHtml(movie.title) + "">" +
            "<span class="poster-year">" + escapeHtml(movie.year) + "</span>" +
            "<span class="poster-play">▶</span>" +
            "</figure></a>" +
            "<div class="movie-card-body">" +
            "<div class="movie-meta-row"><a class="category-pill" href="" + escapeHtml(movie.categoryHref) + "">" + escapeHtml(movie.category) + "</a><span>" + escapeHtml(movie.type) + "</span></div>" +
            "<h3><a href="" + escapeHtml(movie.href) + "">" + escapeHtml(movie.title) + "</a></h3>" +
            "<p>" + escapeHtml(movie.desc) + "</p>" +
            "<div class="movie-tags">" + tags + "</div>" +
            "<div class="movie-stat-row"><span>★ " + escapeHtml(movie.rating) + "</span><span>" + escapeHtml(movie.viewsText) + " 次观看</span></div>" +
            "</div></article>";
    }

    ready(function () {
        var input = document.getElementById("searchInput");
        var form = document.getElementById("searchForm");
        var results = document.getElementById("searchResults");
        var status = document.getElementById("searchStatus");
        if (!input || !form || !results || !status || !window.MOVIE_SEARCH_DATA) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;

        function render() {
            var query = input.value.trim().toLowerCase();
            var data = window.MOVIE_SEARCH_DATA || [];
            var matched;
            if (query) {
                matched = data.filter(function (movie) {
                    return movie.terms.toLowerCase().indexOf(query) !== -1;
                });
            } else {
                matched = data.slice(0, 48);
            }
            matched = matched.slice(0, 120);
            results.innerHTML = matched.map(card).join("");
            status.textContent = matched.length ? "已展示相关内容" : "没有找到相关内容";
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var query = input.value.trim();
            var nextUrl = query ? "search.html?q=" + encodeURIComponent(query) : "search.html";
            window.history.replaceState(null, "", nextUrl);
            render();
        });
        input.addEventListener("input", render);
        render();
    });
})();
