/**
 * Rasterises a DOM node and downloads it as an A4 PDF.
 *
 * Why a snapshot rather than a real vector PDF: the site ships in Arabic, and
 * PDF libraries that run on the server have no bidi/shaping engine — Arabic
 * comes out as isolated letterforms in the wrong order. Letting the browser lay
 * the text out and photographing the result is the only approach that gets
 * Arabic right without vendoring a shaping engine. The cost is a raster PDF:
 * the text isn't selectable and the file is a few hundred KB.
 *
 * `html2canvas-pro`, not `html2canvas`: Tailwind v4 compiles opacity modifiers
 * (`bg-white/10`) to `color-mix(in oklab, …)` and its default palette to
 * `oklch()`, neither of which the original parser understands — it throws
 * "Attempting to parse an unsupported color function". The fork has the same
 * API and supports both.
 */

export interface PdfCaptureOptions {
  fileName: string;
  /** Fixed, not devicePixelRatio — see below. */
  scale?: number;
  assetTimeoutMs?: number;
}

const DEFAULT_SCALE = 2;
const DEFAULT_ASSET_TIMEOUT = 6000;
const PAGE_MARGIN_PT = 24;
/** Squeeze rather than spill when the overflow is this small a fraction. */
const SQUEEZE_TOLERANCE = 1.06;
const MAX_PAGES = 10;

const nextFrame = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );

/**
 * Waits for the node to be genuinely paintable: webfonts settled and every
 * image decoded. html2canvas does not wait for either, and a capture that
 * starts early produces fallback-font text or a missing logo.
 *
 * Every wait resolves on failure as well as success — a blocked logo must
 * degrade to a ticket without a logo, never to no ticket at all.
 */
export async function waitForAssets(
  node: HTMLElement,
  timeoutMs: number = DEFAULT_ASSET_TIMEOUT
): Promise<void> {
  const fonts = document.fonts?.ready ?? Promise.resolve();

  const images = Array.from(node.querySelectorAll("img")).map(
    (img) =>
      new Promise<void>((resolve) => {
        if (img.complete && img.naturalWidth > 0) {
          img.decode().then(
            () => resolve(),
            () => resolve()
          );
          return;
        }
        const done = () => {
          img.removeEventListener("load", done);
          img.removeEventListener("error", done);
          resolve();
        };
        img.addEventListener("load", done);
        img.addEventListener("error", done);
      })
  );

  await Promise.race([
    Promise.all([fonts, ...images]),
    new Promise((resolve) => setTimeout(resolve, timeoutMs)),
  ]);

  // Two frames so React's commit has actually painted before we measure.
  await nextFrame();
}

export async function downloadNodeAsPdf(
  node: HTMLElement,
  options: PdfCaptureOptions
): Promise<void> {
  // Imported here, not at module scope: html2canvas-pro touches `window` on
  // import, and neither library should sit in the first-load bundle of a page
  // whose visitors mostly never click download.
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);

  await waitForAssets(node, options.assetTimeoutMs);

  const width = node.offsetWidth;
  const height = node.scrollHeight;

  const canvas = await html2canvas(node, {
    backgroundColor: "#ffffff",
    // Deliberately not devicePixelRatio: the output must be identical from a
    // 1x laptop and a 3x phone.
    scale: options.scale ?? DEFAULT_SCALE,
    useCORS: true,
    logging: false,
    width,
    height,
    // Without these the clone is measured against the real viewport and
    // anything below the fold is cropped.
    windowWidth: width,
    windowHeight: height,
  });

  const pdf = new jsPDF({
    unit: "pt",
    format: "a4",
    orientation: "portrait",
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const usableWidth = pageWidth - PAGE_MARGIN_PT * 2;
  const usableHeight = pageHeight - PAGE_MARGIN_PT * 2;

  const image = canvas.toDataURL("image/png");
  const fullHeight = (canvas.height / canvas.width) * usableWidth;

  if (fullHeight <= usableHeight) {
    pdf.addImage(image, "PNG", PAGE_MARGIN_PT, PAGE_MARGIN_PT, usableWidth, fullHeight);
  } else if (fullHeight <= usableHeight * SQUEEZE_TOLERANCE) {
    // Just over a page — shrinking a few percent reads far better than a
    // second page holding one line of the footer.
    const scaledWidth = usableWidth * (usableHeight / fullHeight);
    pdf.addImage(
      image,
      "PNG",
      PAGE_MARGIN_PT + (usableWidth - scaledWidth) / 2,
      PAGE_MARGIN_PT,
      scaledWidth,
      usableHeight
    );
  } else {
    let offset = 0;
    for (let page = 0; page < MAX_PAGES && offset < fullHeight; page += 1) {
      if (page > 0) pdf.addPage();
      pdf.addImage(
        image,
        "PNG",
        PAGE_MARGIN_PT,
        PAGE_MARGIN_PT - offset,
        usableWidth,
        fullHeight
      );
      offset += usableHeight;
    }
  }

  pdf.save(options.fileName);
}
