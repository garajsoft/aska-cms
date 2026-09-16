"use client";

import { useEffect } from "react";

export function RichTextStyles() {
  useEffect(() => {
    let resizingImg: HTMLImageElement | null = null;
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;

    // Setup resize on image
    const setupImageResize = (img: HTMLImageElement) => {
      if (img.dataset.resizeSetup === "true") return;
      img.dataset.resizeSetup = "true";

      // Style the image for inline positioning. Payload's own editor theme
      // CSS caps upload preview images at a fixed max-width (e.g. 450px) but
      // leaves max-height uncapped - so once a resize target width exceeded
      // that cap, the rendered width stayed clamped while height kept
      // growing from the (uncapped) target width, visually stretching the
      // image taller instead of wider. Override both caps inline so our
      // explicit width/height take full effect.
      img.style.display = "inline-block";
      img.style.position = "relative";
      img.style.verticalAlign = "top";
      img.style.cursor = "grab";
      img.style.maxWidth = "none";
      img.style.maxHeight = "none";

      // Create resize handle
      const handle = document.createElement("div");
      handle.className = "image-resize-handle";
      handle.title = "Drag to resize (maintains aspect ratio)";

      img.parentElement?.insertBefore(handle, img.nextSibling);

      // Handle mousedown event on handle
      handle.addEventListener("mousedown", (e: MouseEvent) => {
        resizingImg = img;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = img.offsetWidth || img.width || 400;
        startHeight = img.offsetHeight || img.height || 300;
        document.body.style.userSelect = "none";
        document.body.style.cursor = "se-resize";
        e.preventDefault();
        e.stopPropagation();
      });
    };

    // Find all images in editor and setup
    const findAndSetupImages = () => {
      const editors = [
        document.querySelector("[data-lexical-editor]"),
        document.querySelector(".lexical-editor"),
        document.querySelector(".payload-richtext"),
        document.querySelector("[contenteditable]"),
      ].filter(Boolean);

      editors.forEach((editor) => {
        if (!editor) return;
        editor.querySelectorAll("img").forEach((img: any) => {
          if (img.offsetWidth > 0) {
            setupImageResize(img);
          }
        });
      });
    };

    // Global mouse move handler
    const onMouseMove = (e: MouseEvent) => {
      if (!resizingImg) return;

      const deltaX = e.clientX - startX;
      const newWidth = Math.max(60, startWidth + deltaX);
      const aspectRatio = startHeight / startWidth;
      const newHeight = newWidth * aspectRatio;

      resizingImg.style.width = newWidth + "px";
      resizingImg.style.height = newHeight + "px";
    };

    // Global mouse up handler
    const onMouseUp = () => {
      if (resizingImg) {
        resizingImg.style.cursor = "grab";
        resizingImg = null;
      }
      document.body.style.userSelect = "auto";
      document.body.style.cursor = "auto";
    };

    // Attach global event listeners
    document.addEventListener("mousemove", onMouseMove, true);
    document.addEventListener("mouseup", onMouseUp, true);

    // Initial setup
    findAndSetupImages();

    // Watch for content changes
    const observer = new MutationObserver(() => {
      findAndSetupImages();
    });

    // Observe multiple possible locations
    const targets = [
      document.querySelector("[data-lexical-editor]"),
      document.querySelector(".lexical-editor"),
      document.querySelector(".payload-richtext"),
      document.body,
    ].filter(Boolean) as Element[];

    targets.forEach((target) => {
      observer.observe(target, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false,
      });
    });

    // Cleanup
    return () => {
      observer.disconnect();
      document.removeEventListener("mousemove", onMouseMove, true);
      document.removeEventListener("mouseup", onMouseUp, true);
    };
  }, []);

  return (
    <style>{`
      /* Image resize handle */
      .image-resize-handle {
        position: absolute;
        bottom: -12px;
        right: -12px;
        width: 32px;
        height: 32px;
        background: #667eea;
        border: 2px solid white;
        border-radius: 4px;
        cursor: se-resize;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
        user-select: none;
        pointer-events: auto;
      }

      .image-resize-handle::after {
        content: '↘';
        color: white;
        font-size: 18px;
        font-weight: bold;
        line-height: 1;
      }

      .image-resize-handle:hover {
        background: #5568d3;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.6);
      }

      .image-resize-handle:active {
        background: #4a57c2;
      }

      /* Image hover state */
      [data-lexical-editor] img:hover,
      .lexical-editor img:hover,
      .payload-richtext img:hover {
        outline: 2px dashed #667eea;
        outline-offset: 2px;
      }

      /* Lexical figure elements */
      [data-lexical-editor] figure,
      .lexical-editor figure,
      .payload-richtext figure {
        margin: 1em 0;
        position: relative;
      }

      [data-lexical-editor] figure img,
      .lexical-editor figure img,
      .payload-richtext figure img {
        max-width: 100%;
        height: auto;
      }

      [data-lexical-editor] figcaption,
      .lexical-editor figcaption,
      .payload-richtext figcaption {
        font-size: 0.9em;
        color: #666;
        margin-top: 0.5em;
        font-style: italic;
      }
    `}</style>
  );
}
