const axios = require("axios");
// News API endpoint and key
const NEWS_API_URL = "https://newsapi.org/v2/top-headlines";
const NEWS_API_KEY = process.env.NEWS_API_KEY; // Ensure this is set in your .env file

// Endpoint to get news articles based on a search keyword and country code
exports.educationalResources = async (req, res, next) => {
  const keyword = req.query.keyword || "health"; // Default to 'health' if no keyword is provided
  const country = req.query.country || "us"; // Default to 'us' if no country code is provided

  if (!keyword || keyword.trim() === "") {
    return res.status(400).json({ message: "Keyword is required" });
  }

  if (!country || country.trim() === "") {
    return res.status(400).json({ message: "Country is required" });
  }

  try {
    const response = await axios.get(NEWS_API_URL, {
      params: {
        apiKey: NEWS_API_KEY,
        country: country, // Dynamic country code
        q: keyword, // Search query parameter
      },
    });

    // Check if articles are found
    if (response.data.articles.length === 0) {
      return res.status(404).json({
        message: "No articles found for the given keyword and country code",
      });
    }

    res.json(response.data.articles); // Return the API response
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Endpoint to get news articles by keyword
app.get("/api/news/keyword/:keyword", async (req, res) => {
  try {
    const response = await axios.get(NEWS_API_URL, {
      params: {
        apiKey: NEWS_API_KEY,
        country: "us",
        q: req.params.keyword,
      },
    });
    res.json(response.data.articles); // Directly return the API response
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
