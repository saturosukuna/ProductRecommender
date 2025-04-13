import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [query, setQuery] = useState("poco gaming phone above 30k");
  const [preference, setPreference] = useState("");
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  const maxPagesToScrape = 3;

  useEffect(() => {
    document.body.className = darkMode ? "bg-gray-950" : "bg-white";
  }, [darkMode]);

  useEffect(() => {
    fetchAllProducts(query);
  }, []);
  

  useEffect(() => {
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    setProducts(allProducts.slice(start, end));
  }, [currentPage, allProducts]);

  const toggleMode = () => {
    setDarkMode(!darkMode);
  };

  async function scrapeProducts(q, page = 1) {
    try {
      const response = await axios.get(
        `https://api.scraperapi.com/?api_key=12a1bc4ebb1418e0b8f3e811b11114ac&url=${encodeURIComponent(
          `https://www.flipkart.com/search?q=${q}&page=${page}`
        )}`
      );

      const html = response.data;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const productsData = [];
      const seenTitles = new Set();

      const productContainers = doc.querySelectorAll("div.tUxRFH, div._1sdMkc");
      productContainers.forEach((product) => {
        const title =
          product.querySelector(".KzDlHZ")?.innerText ||
          product.querySelector("a.WKTcLC")?.innerText ||
          "No Title";

        if (seenTitles.has(title)) return;
        seenTitles.add(title);

        const price = product.querySelector(".Nx9bqj")?.innerText ?? "No Price";
        const image = product.querySelector("img")?.src ?? "";
        const link =
          "https://www.flipkart.com" +
          (product.querySelector("a")?.getAttribute("href") ?? "");
        const rating = product.querySelector("span.Y1HWO0")?.innerText ?? "No Rating";
        const discount = product.querySelector("div.UkUFwK")?.innerText ?? "";
        const specifications = Array.from(
          product.querySelectorAll("ul.G4BRas li")
        ).map((li) => li.innerText);

        productsData.push({
          title,
          price,
          image,
          link,
          rating,
          discount,
          reviews: "N/A",
          specifications,
        });
      });

      return productsData;
    } catch (err) {
      console.error(`Error scraping page ${page}:`, err);
      return [];
    }
  }

  async function fetchAllProducts(q) {
    setLoading(true);
    const page1Products = await scrapeProducts(q, 1);
    setAllProducts(page1Products);
    setProducts(page1Products.slice(0, productsPerPage));
    setCurrentPage(1); // Reset to page 1 on new search
    setLoading(false);

    const additionalProducts = [];
    for (let page = 2; page <= maxPagesToScrape; page++) {
      const products = await scrapeProducts(q, page);
      additionalProducts.push(...products);
      setAllProducts((prev) => [...prev, ...products]);
    }
  }

  async function recommendProducts() {
    setRecommendation("Generating recommendations using Gemini...");

    const prompt = `
      You are a Flipkart product recommender. The user says: '${preference}'
      Here are products:

      ${products
        .map(
          (p) =>
            `Product: ${p.title}\nPrice: ${p.price}\nRating: ${p.rating}\nSpecs: ${p.specifications.join(", ")}\n`
        )
        .join("\n")}

      Recommend top 3 products and explain why.
    `;

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCim0N6_iy6cGMKGDTK_ESF0EAGvBAOB6Y",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response";
      // Preprocess Gemini response
      const processedText = preprocessGeminiResponse(rawText);
      setRecommendation(processedText);
    } catch (err) {
      console.error("Error recommending products:", err);
      setRecommendation("Failed to get recommendation.");
    }
  }

  // Function to preprocess Gemini response
  const preprocessGeminiResponse = (text) => {
    // Remove markdown artifacts and clean up formatting
    let cleanedText = text
      .replace(/(\*\*|\*|__|_|#)/g, "") // Remove markdown symbols
      .replace(/\n\s*\n/g, "\n") // Remove excessive newlines
      .trim();

    // Structure the response into sections (assuming Gemini lists products)
    const lines = cleanedText.split("\n");
    let formattedText = "";
    let currentSection = "";

    lines.forEach((line) => {
      if (line.match(/^\d+\./) || line.toLowerCase().includes("product")) {
        // Start of a new product recommendation
        if (currentSection) {
          formattedText += `${currentSection}\n\n`;
        }
        currentSection = `**${line}**`;
      } else if (line) {
        // Add details under the current product
        currentSection += `\n- ${line}`;
      }
    });

    // Append the last section
    if (currentSection) {
      formattedText += currentSection;
    }

    return formattedText || "No recommendations provided.";
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(allProducts.length / productsPerPage)) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top
    }
  };

  return (
    <div
      className={`w-full mx-auto px-4 py-8 min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-950 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Toggle Switch */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold">📱 Flipkart Recommender</h1>
        <label className="px-2 flex items-center space-x-3">
          <span className="text-sm font-medium">{darkMode ? "Dark" : "Light"} Mode</span>
          <input
            type="checkbox"
            className="toggle toggle-sm"
            checked={darkMode}
            onChange={toggleMode}
          />
        </label>
      </div>

      {/* Search + Preferences */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <input
          className={`p-3 border rounded w-full ${
            darkMode
              ? "bg-gray-800 border-gray-700 text-white"
              : "bg-gray-100 border-gray-300 text-gray-900"
          }`}
          placeholder="Search for smartphone..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchAllProducts(query) && setRecommendation("")}
        />
        <span
          className={`font-semibold px-6 py-3 rounded shadow transition-colors ${
            darkMode
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
          onClick={() => {fetchAllProducts(query);setRecommendation("");}}
        >
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M15.25 0a8.25 8.25 0 0 0-6.18 13.72L1 22.88l1.12 1l8.05-9.12A8.251 8.251 0 1 0 15.25.01zm0 15a6.75 6.75 0 1 1 0-13.5a6.75 6.75 0 0 1 0 13.5"/></svg>
          Search
         
        </span>
      </div>

      <input
        className={`w-full p-3 border rounded mb-4 ${
          darkMode
            ? "bg-gray-800 border-gray-700 text-white"
            : "bg-gray-100 border-gray-300 text-gray-900"
        }`}
        placeholder="Enter your preference (e.g., gaming, battery, camera)..."
        value={preference}
        onChange={(e) => setPreference(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && recommendProducts()}
      />

      <span
       
        className={`font-semibold px-6 py-3 rounded shadow transition-colors ${
          darkMode
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
        onClick={recommendProducts}
      >
           🤖 Recommend with Gemini
       </span>
    
      {/* Gemini Result */}
      {recommendation && (
        <div
          className={`p-6 rounded-xl shadow border mt-6 whitespace-pre-wrap ${
            darkMode
              ? "bg-gray-900 border-green-600 text-green-200"
              : "bg-gray-100 border-green-400 text-green-800"
          }`}
        >
          <h2 className="text-xl font-bold mb-2">Gemini Recommends:</h2>
          {recommendation.split("\n").map((line, i) => (
            <p key={i} className={line.startsWith("**") ? "font-bold mt-2" : ""}>
              {line.replace(/\*\*/g, "")}
            </p>
          ))}
        </div>
      )}

      {/* Loader */}
      {loading && (
        <div className="flex justify-center items-center mt-6">
          <div className="w-10 h-10 border-4 border-blue-300 border-dashed rounded-full animate-spin"></div>
          <p className="ml-4">Fetching products...</p>
        </div>
      )}

      {/* Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {products.map((p, i) => (
          <div
            key={i}
            className={`border p-4 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 ${
              darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-300"
            }`}
          >
            <img
              src={p.image}
              alt="product"
              className="w-full h-52 object-contain mb-3 rounded"
            />
            <h2 className="text-lg font-semibold mb-1">{p.title}</h2>
            <p className="text-green-500 font-bold">{p.price}</p>
            <p className="text-sm">
              {p.rating} rating | {p.reviews}
            </p>
            {p.discount && (
              <p className="text-red-500 font-medium text-sm mt-1">{p.discount}</p>
            )}
            {p.specifications.length > 0 && (
              <ul className="text-sm mt-2 list-disc pl-5">
                {p.specifications.slice(0, 5).map((s, j) => (
                  <li key={j}>{s}</li>
                ))}
              </ul>
            )}
            <a
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline text-sm mt-3 inline-block"
            >
              View on Flipkart
            </a>
          </div>
        ))}
      </div>

      {/* Pagination Controls (shown only after search) */}
      {allProducts.length > 0 && (
        <div
          className={`fixed bottom-0 left-0 right-0 py-4 flex justify-center items-center gap-4 ${
            darkMode ? "bg-gray-950 border-t border-gray-800" : "bg-white border-t border-gray-300"
          }`}
        >
          <span
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              currentPage === 1
                ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                : darkMode
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Prev
          </span>
          <span className="text-sm font-medium">
            Page {currentPage} of {Math.ceil(allProducts.length / productsPerPage)}
          </span>
          <span
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              currentPage >= Math.ceil(allProducts.length / productsPerPage)
                ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                : darkMode
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            onClick={handleNextPage}
            disabled={currentPage >= Math.ceil(allProducts.length / productsPerPage)}
          >
            Next
          </span>
        </div>
      )}
    </div>
  );
}

export default App;