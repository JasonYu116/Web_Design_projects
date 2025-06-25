document.addEventListener("DOMContentLoaded", () => {
    const postBtn = document.querySelector("button.submit-content");
    const textarea = document.querySelector("textarea.post-content");
    const feed = document.querySelector(".feed");
    const tagsContainer = document.querySelector(".tags");

    const selectedTags = new Set();

    function loadPosts() {
        let url = "/tagged_posts/api/posts";
        if (selectedTags.size > 0) {
            const tagsParam = Array.from(selectedTags).join(",");
            url += "?tags=" + encodeURIComponent(tagsParam);
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                feed.innerHTML = "";
                if (data.posts.length === 0) {
                    const defaultPost = createPostDiv({ content: "#boring", id: -1 });
                    feed.appendChild(defaultPost);
                } else {
                    for (const post of data.posts) {
                        const postDiv = createPostDiv(post);
                        feed.appendChild(postDiv);
                    }
                }
            });
    }

    function loadTags() {
        fetch("/tagged_posts/api/tags")
            .then(response => response.json())
            .then(data => {
                const sortedTags = data.tags.sort();
                tagsContainer.innerHTML = "";
                for (const tag of sortedTags) {
                    const tagDiv = createTagDiv(tag);
                    tagsContainer.appendChild(tagDiv);
                }
            });
    }

    function refreshFeedAndTags() {
        loadPosts();
        loadTags();
    }

    function createPostDiv(post) {
        const div = document.createElement("div");
        div.className = "post_item box";

        const contentDiv = document.createElement("div");
        contentDiv.innerText = post.content;

        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "Delete";
        deleteBtn.className = "button is-danger is-small mt-2";
        deleteBtn.addEventListener("click", () => {
            fetch(`/tagged_posts/api/posts/${post.id}`, {
                method: "DELETE"
            }).then(() => {
                refreshFeedAndTags(); // safe to reload everything on deletion
            });
        });

        div.appendChild(contentDiv);
        div.appendChild(deleteBtn);
        return div;
    }

    function createTagDiv(name) {
        const div = document.createElement("div");
        div.className = "tag";
        div.innerText = name;
        if (selectedTags.has(name)) {
            div.classList.add("selected");
        }
        return div;
    }

    // Only update selection and reload posts — do not reload tags!
    tagsContainer.addEventListener("click", (event) => {
        const tagEl = event.target;
        if (tagEl.classList.contains("tag")) {
            const tagName = tagEl.innerText.trim();
            if (selectedTags.has(tagName)) {
                selectedTags.delete(tagName);
            } else {
                selectedTags.add(tagName);
            }
            loadPosts(); // reload only posts, avoid tag refresh race condition
        }
    });

    postBtn.addEventListener("click", () => {
        const content = textarea.value.trim();
        if (content !== "") {
            fetch("/tagged_posts/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            }).then(() => {
                textarea.value = "";
                refreshFeedAndTags(); // safe to reload both after post creation
            });
        }
    });

    // Initial load
    refreshFeedAndTags();
});
