import { useEffect, useRef, useState } from "react";

const API_URL = "https://ecommerce-api3.p.rapidapi.com/laptops";
const API_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const PAGE_SIZE = 20;

function getProducts(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function getProductDetails(product) {
  const image =
    product.Image || product.image || product.thumbnail || product.imageUrl;
  const title =
    product.Description || product.title || product.name || "Untitled product";
  const price =
    product.Price ?? product.price ?? product.discountedPrice ?? "N/A";
  const brand = product.Brand || product.brand || "Laptop";
  const tag = product.Tag || product.tag || "Laptop";

  return { image, title, price, brand, tag };
}

function ProductCard({ product, onSelect }) {
  const { image, title, price, brand, tag } = getProductDetails(product);

  return (
    <article
      className="product-card"
      role="button"
      tabIndex="0"
      onClick={() => onSelect(product)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(product);
        }
      }}
      aria-label={`View details for ${title}`}
    >
      <div className="product-image-wrap">
        {image ? (
          <img src={image} alt={title} className="product-image" />
        ) : (
          <span>No image</span>
        )}
      </div>
      <div className="product-info">
        <div className="product-meta">
          
          <span className="product-tag">{tag}</span>
        </div>
        <h2 className="product-title">{brand}</h2>
        <p className="product-price">
          {typeof price === "number" ? `$${price}` : price}
        </p>
      </div>
    </article>
  );
}

function ProductDetails({ product, onClose }) {
  const { image, title, price, brand, tag } = getProductDetails(product);
  const sourceId = product["Unnamed: 0"];

  return (
    <div className="details-backdrop" role="presentation" onClick={onClose}>
      <section
        className="details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-details-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="details-close"
          onClick={onClose}
          aria-label="Close product details"
        >
          &times;
        </button>
        <div className="details-image-wrap">
          {image ? (
            <img src={image} alt={title} className="details-image" />
          ) : (
            <span>No image</span>
          )}
        </div>
        <div className="details-content">
          <p className="eyebrow">Product details</p>
          <h2 id="product-details-title">{brand}</h2>
          <p className="details-price">
            {typeof price === "number" ? `$${price}` : price}
          </p>
          <dl className="details-list">
            <div>
              <dt>Specs</dt>
              <dd>{title}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{tag}</dd>
            </div>
            {sourceId !== undefined && (
              <div>
                <dt>Product index</dt>
                <dd>{sourceId}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>
    </div>
  );
}

const App = () => {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState(API_KEY ? "loading" : "missing-key");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const pageTimer = useRef(null);

  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visibleProducts = products.slice(pageStart, pageStart + PAGE_SIZE);
  const firstPageButton = Math.min(
    Math.max(currentPage - 1, 1),
    Math.max(totalPages - 3, 1),
  );
  const pageNumbers = Array.from(
    { length: Math.min(totalPages, 4) },
    (_, index) => firstPageButton + index,
  );

  const changePage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage || pageLoading) {
      return;
    }

    setPageLoading(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    pageTimer.current = window.setTimeout(() => {
      setCurrentPage(page);
      setPageLoading(false);
    }, 1000);
  };

  useEffect(() => {
    return () => window.clearTimeout(pageTimer.current);
  }, []);

  useEffect(() => {
    if (!API_KEY) return;

    const loadProducts = async () => {
      try {
        const response = await fetch(API_URL, {
          headers: {
            "Content-Type": "application/json",
            "x-rapidapi-host": "ecommerce-api3.p.rapidapi.com",
            "x-rapidapi-key": API_KEY,
          },
        });

        if (!response.ok)
          throw new Error(`Request failed with status ${response.status}`);

        const payload = await response.json();
        setProducts(getProducts(payload));
        setStatus("success");
      } catch (requestError) {
        setError(requestError.message);
        setStatus("error");
      }
    };

    loadProducts();
  }, []);

  return (
    <main aria-busy={pageLoading}>
      <header className="site-header">
        <div className="brand-mark">SOLEA</div>
        <span className="api-badge">RapidAPI demo</span>
      </header>

      <section className="hero">
        <p className="eyebrow">Latest tech / curated essentials</p>
        <h1>Find your next laptop.</h1>
        <p className="hero-copy">
          A small storefront powered by live laptop data from the Ecommerce API.
        </p>
      </section>

      <section className="catalogue">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Live catalogue</p>
            <h2>Laptops</h2>
          </div>
          {status === "success" && (
            <span className="result-count">
              {products.length > 0
                ? `Showing ${pageStart + 1}-${Math.min(
                    pageStart + PAGE_SIZE,
                    products.length,
                  )} of ${products.length}`
                : "0 products"}
            </span>
          )}
        </div>

        {status === "loading" && (
          <p className="message">Loading products from RapidAPI...</p>
        )}
        {status === "missing-key" && (
          <div className="message setup-message">
            <strong>API key needed</strong>
            <p>
              Create a `.env` file with `VITE_RAPIDAPI_KEY=your_key_here`,
              restart Vite, and refresh.
            </p>
          </div>
        )}
        {status === "error" && (
          <p className="message error-message">
            Could not load products: {error}
          </p>
        )}
        {status === "success" && products.length === 0 && (
          <p className="message">The API returned no products.</p>
        )}
        {status === "success" && products.length > 0 && (
          <>
            <div className="product-grid">
              {visibleProducts.map((product, index) => (
                <ProductCard
                  key={product.id || product._id || pageStart + index}
                  product={product}
                  onSelect={setSelectedProduct}
                />
              ))}
            </div>

            <nav className="pagination" aria-label="Laptop catalogue pages">
              <button
                type="button"
                className="page-arrow"
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1 || pageLoading}
                aria-label="Previous page"
              >
                &larr;
              </button>
              {pageNumbers.map((page) => (
                <button
                  type="button"
                  className={`page-number ${
                    page === currentPage ? "active" : ""
                  }`}
                  onClick={() => changePage(page)}
                  disabled={pageLoading}
                  aria-current={page === currentPage ? "page" : undefined}
                  key={page}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                className="page-arrow"
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages || pageLoading}
                aria-label="Next page"
              >
                &rarr;
              </button>
            </nav>
          </>
        )}
      </section>
      {pageLoading && (
        <div className="page-transition" role="status" aria-live="polite">
          <div className="page-loader" aria-label="Loading">
            <span className="loader-ring" />
          </div>
        </div>
      )}
      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </main>
  );
};

export default App;
