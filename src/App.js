import React, { useEffect, useState } from "react";
import "./App.css"; // CSS file

export default function App() {
  const [images, setImages] = useState([]);
  const [query, setQuery] = useState("mars"); // default search
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchImages = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setError("Please enter a search term.");
      setImages([]);
      return;
    }

    setLoading(true);
    setError("");
    setImages([]);

    try {
      const res = await fetch(
        `https://images-api.nasa.gov/search?q=${encodeURIComponent(
          searchTerm
        )}&media_type=image`
      );
      const data = await res.json();
      const items = data.collection?.items || [];

      // NASA sometimes returns irrelevant stuff — filter properly
      const filtered = items.filter((item) => {
        const title = item.data?.[0]?.title?.toLowerCase() || "";
        const keywords = item.data?.[0]?.keywords?.join(" ").toLowerCase() || "";
        return (
          title.includes(searchTerm.toLowerCase()) ||
          keywords.includes(searchTerm.toLowerCase())
        );
      });

      if (filtered.length === 0) {
        setError("No images found. Try another keyword.");
      }

      setImages(filtered);
    } catch (err) {
      setError("Error fetching NASA images. Try again later.");
      console.error("NASA API error:", err);
    }
    setLoading(false);
  };

  // Debounced search on typing
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchImages(query);
    }, 700); // wait 700ms after typing

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div className="app">
      <h1 className="title">NASA Image Gallery</h1>

      {/* Search box (no button, live search) */}
      <div className="search-bar">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type to search NASA images..."
        />
      </div>

      {/* Error / Status */}
      {error && <p className="error">{error}</p>}
      {loading && <p className="loading">Loading images...</p>}

      {/* Gallery */}
      <div className="gallery">
        {images.map((item, idx) => {
          const imgSrc = item.links?.[0]?.href;
          const title = item.data?.[0]?.title || "No Title";
          return (
            <div key={idx} className="card">
              {imgSrc && <img src={imgSrc} alt={title} />}
              <div className="card-content">
                <p>{title}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
