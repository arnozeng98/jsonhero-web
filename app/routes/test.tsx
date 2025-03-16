export default function TestPage() {
  return (
    <div style={{ 
      fontFamily: "Arial, sans-serif", 
      maxWidth: "800px", 
      margin: "0 auto", 
      padding: "20px"
    }}>
      <h1 style={{ color: "#1a365d" }}>Test Page</h1>
      
      <p>This is a test page to verify that routing is working correctly.</p>
      
      <h2 style={{ color: "#2a4365", marginTop: "20px" }}>Available Routes:</h2>
      
      <ul style={{ lineHeight: "2" }}>
        <li>
          <a 
            href="/"
            style={{ color: "#3182ce", textDecoration: "underline" }}
          >
            Home (should redirect to /j/criminal-cases)
          </a>
        </li>
        <li>
          <a 
            href="/j/criminal-cases"
            style={{ color: "#3182ce", textDecoration: "underline" }}
          >
            Direct Link to Criminal Cases JSON View
          </a>
        </li>
        <li>
          <a 
            href="/criminal-cases"
            style={{ color: "#3182ce", textDecoration: "underline" }}
          >
            Criminal Cases (should redirect to /j/criminal-cases)
          </a>
        </li>
      </ul>
      
      <h2 style={{ color: "#2a4365", marginTop: "20px" }}>Debug Info:</h2>
      <pre style={{ 
        background: "#edf2f7", 
        padding: "10px", 
        borderRadius: "5px",
        overflowX: "auto" 
      }}>
        {JSON.stringify({
          url: typeof window !== "undefined" ? window.location.href : "server-side",
          timestamp: new Date().toISOString()
        }, null, 2)}
      </pre>
    </div>
  );
} 