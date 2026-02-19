import { useState, useEffect } from "react";

const DomDemo = () => {
  const [titleColor, setTitleColor] = useState("black");
  const [textColor, setTextColor] = useState("black");
  const [flashId, setFlashId] = useState<"title" | "text" | null>(null);
  const [selectedElement, setSelectedElement] = useState<"title" | "text" | null>(null);
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  const changeColor = (id: "title" | "text") => {
    if (selectedElement !== id) {
      const elementName = id === "title" ? "title" : "paragraph";
      const buttonName = id === "title" ? "Get title element by id" : "Get paragraph element by id";
      setHintMessage(`Get the ${elementName} element from the DOM first — click "${buttonName}" in the middle panel, then try again.`);
      return;
    }
    setHintMessage(null);
    if (id === "title") {
      setTitleColor("blue");
      setFlashId("title");
    } else {
      setTextColor("blue");
      setFlashId("text");
    }
  };

  const getElementById = (id: "title" | "text") => {
    setSelectedElement(id);
    setHintMessage(null);
  };

  const resetStyles = () => {
    setTitleColor("black");
    setTextColor("black");
    setFlashId(null);
  };

  useEffect(() => {
    if (flashId === null) return;
    const t = setTimeout(() => setFlashId(null), 400);
    return () => clearTimeout(t);
  }, [flashId]);

  return (
    <>
      <style>{`
        .dom-demo {
          font-family: monospace;
          background: #ffffff;
        }
        .dom-demo .dom-layout {
          display: flex;
          flex-direction: row;
          gap: 40px;
          padding: 40px;
          flex-wrap: wrap;
        }
        .dom-demo .dom-preview,
        .dom-demo .dom-dom-section,
        .dom-demo .dom-code {
          flex: 1 1 260px;
          min-width: 0;
        }
        .dom-demo .dom-dom-section {
          display: flex;
          flex-direction: column;
        }
        .dom-demo .dom-tree {
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 16px;
          font-size: 0.8125rem;
          line-height: 1.7;
        }
        .dom-demo .dom-tree .dom-node {
          padding: 2px 6px;
          border-radius: 4px;
          transition: background 0.2s ease;
        }
        .dom-demo .dom-tree .dom-node--selected {
          background: #c8e6c9;
          font-weight: 600;
        }
        .dom-demo .dom-get-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .dom-demo .dom-get-buttons button {
          background: #e3f2fd;
          border-color: #2196f3;
          color: #1565c0;
        }
        .dom-demo .dom-get-buttons button:hover {
          background: #bbdefb;
        }
        .dom-demo .dom-hint {
          margin-top: 12px;
          padding: 10px 12px;
          background: #fff8e1;
          border: 1px solid #ffc107;
          border-radius: 6px;
          font-size: 0.8125rem;
          color: #5d4200;
        }
        .dom-demo .dom-preview h2,
        .dom-demo .dom-code h2,
        .dom-demo .dom-dom-section h2 {
          margin-bottom: 16px;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1a1a1a;
        }
        .dom-demo .dom-preview h1 {
          margin: 0 0 12px 0;
          font-size: 1.5rem;
          transition: color 0.2s ease;
        }
        .dom-demo .dom-preview p {
          margin: 0 0 16px 0;
          transition: color 0.2s ease;
        }
        .dom-demo .dom-code pre {
          background: #f4f4f4;
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 0;
          font-size: 0.875rem;
          line-height: 1.6;
          white-space: pre;
          word-break: normal;
        }
        .dom-demo button {
          margin: 5px 5px 5px 0;
          padding: 8px 12px;
          cursor: pointer;
          border: 1px solid #ccc;
          border-radius: 4px;
          background: #f0f0f0;
          font-family: inherit;
          font-size: 0.875rem;
        }
        .dom-demo button:hover {
          background: #e0e0e0;
        }
        .dom-demo .color-value {
          background-color: #fff3a3;
          padding: 2px 4px;
          border-radius: 3px;
          font-weight: bold;
          transition: background-color 0.2s ease;
        }
        .dom-demo .flash {
          background-color: #a3f7b5;
        }
        @media (max-width: 768px) {
          .dom-demo .dom-layout {
            flex-direction: column;
            padding: 20px;
            gap: 24px;
          }
          .dom-demo .dom-preview,
          .dom-demo .dom-dom-section,
          .dom-demo .dom-code {
            flex: 1 1 100%;
            width: 100%;
          }
          .dom-demo .dom-code pre {
            font-size: 0.8125rem;
            padding: 12px;
          }
        }
      `}</style>
      <div className="dom-demo rounded-lg border bg-card p-0 overflow-hidden">
        <div className="dom-layout">
          {/* LEFT: LIVE PAGE */}
          <div className="dom-preview">
            <h2>Live Page</h2>
            <h1 id="title" style={{ color: titleColor }}>
              Welcome to My Page
            </h1>
            <p id="text" style={{ color: textColor }}>
              Click a button to change my color.
            </p>
            <div className="buttons">
              <button type="button" onClick={() => changeColor("title")}>
                Change Title Color
              </button>
              <button type="button" onClick={() => changeColor("text")}>
                Change Paragraph Color
              </button>
              <button type="button" onClick={resetStyles}>
                Reset
              </button>
            </div>
            {hintMessage && <div className="dom-hint" role="alert">{hintMessage}</div>}
          </div>

          {/* MIDDLE: BROWSER DOM */}
          <div className="dom-dom-section">
            <h2>Browser DOM</h2>
            <p style={{ marginBottom: 12, fontSize: "0.8125rem", color: "#555" }}>
              Internal map of the page. Get an element by ID to modify it.
            </p>
            <div className="dom-tree">
              <div>document</div>
              <div style={{ paddingLeft: 12 }}>└ html</div>
              <div style={{ paddingLeft: 24 }}>└ body</div>
              <div style={{ paddingLeft: 36 }}>└ div.layout</div>
              <div style={{ paddingLeft: 48 }}>└ div.preview</div>
              <div style={{ paddingLeft: 60 }} className={`dom-node ${selectedElement === "title" ? "dom-node--selected" : ""}`}>
                └ h1#title
              </div>
              <div style={{ paddingLeft: 60 }} className={`dom-node ${selectedElement === "text" ? "dom-node--selected" : ""}`}>
                └ p#text
              </div>
              <div style={{ paddingLeft: 60 }}>└ div.buttons</div>
            </div>
            <div className="dom-get-buttons">
              <button type="button" onClick={() => getElementById("title")}>
                Get title element by id
              </button>
              <button type="button" onClick={() => getElementById("text")}>
                Get paragraph element by id
              </button>
            </div>
          </div>

          {/* RIGHT: CODE VIEW */}
          <div className="dom-code">
            <h2>HTML Code</h2>
            <pre id="codeDisplay">
              {`<h1 id="title" style="color: `}
              <span
                className={`color-value ${flashId === "title" ? "flash" : ""}`}
                id="titleColor"
              >
                {titleColor}
              </span>
              {`;">Welcome to My Page</h1>
<p id="text" style="color: `}
              <span
                className={`color-value ${flashId === "text" ? "flash" : ""}`}
                id="textColor"
              >
                {textColor}
              </span>
              {`;">Click a button to change my color.</p>`}
            </pre>
          </div>
        </div>
      </div>
    </>
  );
};

export default DomDemo;
