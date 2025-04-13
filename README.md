<h1>Flipkart Product Recommender</h1>

<div>
  <h2>Project Overview</h2>
  <p>
    The Flipkart Product Recommender is a web application designed to help users find products on Flipkart by scraping product data and providing personalized recommendations.
  </p>
</div>

<div>
  <h2>Features</h2>
  <ul>
    <li>Search for products using keywords (e.g., "smartphone").</li>
    <li>Scrape product details from Flipkart, including title, price, rating, specifications, and more.</li>
    <li>Pagination to browse products across multiple pages, with 12 products per page.</li>
    <li>Background scraping to load additional pages after displaying the first page.</li>
    <li>Personalized recommendations powered by Gemini AI based on user preferences (e.g., "gaming", "camera").</li>
    <li>Dark and light mode toggle for better user experience.</li>
    <li>Fixed pagination bar at the bottom for easy navigation (shown only after search).</li>
    <li>Cleaned and formatted Gemini AI responses for improved readability.</li>
  </ul>
</div>

<div>
  <h2>Technologies Used</h2>
  <ul>
    <li>React for building the user interface.</li>
    <li>Axios for making HTTP requests to scrape Flipkart data.</li>
    <li>ScraperAPI to fetch product data from Flipkart.</li>
    <li>Gemini AI API for generating product recommendations.</li>
    <li>Tailwind CSS-inspired classes for styling.</li>
    <li>DOMParser for parsing scraped HTML content.</li>
  </ul>
</div>

<div>
  <h2>Key Functionalities</h2>
  <p><strong>Product Scraping:</strong></p>
  <ul>
    <li>Fetches product details like title, price, image, rating, discount, and specifications.</li>
    <li>Handles multiple Flipkart page layouts for robust scraping.</li>
    <li>Deduplicates products by title to avoid redundancy.</li>
  </ul>
  <p><strong>Pagination:</strong></p>
  <ul>
    <li>Displays 12 products per page with "Next" and "Previous" buttons.</li>
    <li>Loads first page immediately and scrapes additional pages in the background.</li>
    <li>Fixed bottom bar for pagination, visible only after a search.</li>
  </ul>
  <p><strong>Recommendations:</strong></p>
  <ul>
    <li>Allows users to input preferences (e.g., "battery life").</li>
    <li>Uses Gemini AI to recommend top 3 products with explanations.</li>
    <li>Preprocesses AI responses to remove markdown and structure content clearly.</li>
  </ul>
  <p><strong>UI/UX:</strong></p>
  <ul>
    <li>Responsive grid layout for product display (1-3 columns based on screen size).</li>
    <li>Consistent dark/light mode styling for buttons, inputs, and backgrounds.</li>
    <li>Loading indicators during scraping and recommendation generation.</li>
  </ul>
</div>
