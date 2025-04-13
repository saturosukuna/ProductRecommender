import { useState } from "react";
import axios from "axios";

function App() {
  const [query, setQuery] = useState("smartphone");
  const [preference, setPreference] = useState("");
  const [products, setProducts] = useState([]);
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(false);

  async function scrapeProducts(query) {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.scraperapi.com/?api_key=12a1bc4ebb1418e0b8f3e811b11114ac&url=${encodeURIComponent(
          `https://www.flipkart.com/search?q=${query}`
        )}`
      );
  
      const html = response.data;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const productsData = [];
      const queryLower = query.toLowerCase();
  
      // 📱 Electronics
      if (["phone", "laptop", "tv", "fridge", "fan", "camera", "headphone", "monitor"].some(k => queryLower.includes(k))) {
        const productContainers = doc.querySelectorAll("div.tUxRFH");
        productContainers.forEach(product => {
          const title = product.querySelector(".KzDlHZ")?.innerText ?? "No Title";
          const price = product.querySelector(".Nx9bqj")?.innerText ?? "No Price";
          const image = product.querySelector("img")?.src ?? "No Image";
          const link = "https://www.flipkart.com" + (product.querySelector("a.CGtC98")?.getAttribute("href") ?? "");
          const rating = product.querySelector("span.Y1HWO0")?.innerText ?? "No Rating";
          const discount = product.querySelector("div.UkUFwK")?.innerText ?? "";
          const specifications = Array.from(product.querySelectorAll("ul.G4BRas li")).map(li => li.innerText);
  
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
      }
  
      // 👗 Fashion
      else if (["dress", "shirt", "jeans", "kurti", "saree", "clothing", "tshirt", "top"].some(k => queryLower.includes(k))) {
        const productContainers = doc.querySelectorAll("div._1sdMkc");
        productContainers.forEach(product => {
          const title = product.querySelector("a.WKTcLC")?.innerText ?? "No Title";
          const brand = product.querySelector("div.syl9yP")?.innerText ?? "No Brand";
          const price = product.querySelector(".Nx9bqj")?.innerText ?? "No Price";
          const image = product.querySelector("img._53J4C-")?.src ?? "No Image";
          const link = "https://www.flipkart.com" + (product.querySelector("a.rPDeLR")?.getAttribute("href") ?? "");
          const discount = product.querySelector("div.UkUFwK")?.innerText ?? "";
          const size = product.querySelector("div.OCRRMR")?.innerText.replace("Size", "").trim() ?? "No Size";
  
          productsData.push({
            title,
            brand,
            price,
            image,
            link,
            discount,
            rating: "N/A",
            reviews: "N/A",
            specifications: [size],
          });
        });
      }
  
      // 🪑 Other
      else {
        const productContainers = doc.querySelectorAll("div.tUxRFH, div._1sdMkc");
        productContainers.forEach(product => {
          const title = (product.querySelector(".KzDlHZ") || product.querySelector("a.WKTcLC"))?.innerText ?? "No Title";
          const price = product.querySelector(".Nx9bqj")?.innerText ?? "No Price";
          const image = product.querySelector("img")?.src ?? "No Image";
          const link = "https://www.flipkart.com" + (product.querySelector("a")?.getAttribute("href") ?? "");
  
          productsData.push({
            title,
            price,
            image,
            link,
            rating: "N/A",
            discount: "N/A",
            reviews: "N/A",
            specifications: [],
          });
        });
      }
  
      console.log(productsData);
      setProducts(productsData.slice(0, 12)); // Limit to 12
    } catch (err) {
      console.error("Error scraping products:", err);
      alert("Failed to fetch products. Please try again.");
    }
    setLoading(false);
  }
  
  
  async function recommendProducts() {
    setRecommendation("Generating recommendations using Gemini...");
    
    const prompt = `
      You are a Flipkart product recommender. The user says: '${preference}'
      Here are products:

      ${products
        .map(
          p => `Product: ${p.title}\nPrice: ${p.price}\nRating: ${p.rating}\nSpecs: ${p.specifications.join(", ")}\n`
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
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response";
      setRecommendation(text);
    } catch (err) {
      console.error("Error recommending products:", err);
      setRecommendation("Failed to get recommendation.");
    }
  }

  return (
    <div className="w-full mx-auto px-4 py-8 bg-gray-50 min-h-screen">
    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-6 text-center">
      📱 Flipkart Product Recommender
    </h1>
  
    {/* Search Bar */}
    <div className="flex flex-col md:flex-row gap-3 mb-4">
      <input
        className="p-3 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Search for smartphone..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded transition"
        onClick={() => scrapeProducts(query)}
      >
        🔍 Search
      </button>
    </div>
  
    {/* Preference Input */}
    <input
      className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
      placeholder="Enter your preference (e.g., gaming, camera, battery)..."
      value={preference}
      onChange={e => setPreference(e.target.value)}
    />
  
    {/* Recommend Button */}
    <button
      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded shadow transition"
      onClick={recommendProducts}
    >
      🤖 Recommend with Gemini
    </button>
  
    {/* Gemini Recommendation */}
    {recommendation && (
      <div className="bg-white p-6 rounded shadow mt-6 whitespace-pre-wrap border-l-4 border-green-500">
        <h2 className="text-xl font-bold mb-2 text-green-700">Gemini Recommends:</h2>
        <div className="text-gray-700">{recommendation}</div>
      </div>
    )}
  
    {/* Loading Spinner */}
    {loading && (
      <div className="flex justify-center items-center mt-6">
        <div className="w-10 h-10 border-4 border-blue-400 border-dashed rounded-full animate-spin"></div>
        <p className="ml-4 text-gray-600">Fetching products...</p>
      </div>
    )}
  
    {/* Product Cards Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {products.map((p, i) => (
        <div
          key={i}
          className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition duration-300"
        >
          <img
            src={p.image}
            alt="product"
            className="w-full h-52 object-contain mb-3 rounded"
          />
          <h2 className="text-lg font-semibold text-gray-800 mb-1">{p.title}</h2>
          <p className="text-green-600 font-bold">{p.price}</p>
          <p className="text-gray-500 text-sm">
            {p.rating} rating | {p.reviews}
          </p>
          {p.discount && (
            <p className="text-red-500 font-medium text-sm mt-1">{p.discount}</p>
          )}
          {p.specifications.length > 0 && (
            <ul className="text-sm mt-2 list-disc pl-5 text-gray-700">
              {p.specifications.slice(0, 5).map((s, j) => (
                <li key={j}>{s}</li>
              ))}
            </ul>
          )}
          <a
            href={p.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline text-sm mt-3 inline-block"
          >
            View on Flipkart
          </a>
        </div>
      ))}
    </div>
  </div>
  
  );
}

export default App;
