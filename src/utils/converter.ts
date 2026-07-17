import { FileAnalysis } from '../types';

/**
 * Analyzes an uploaded HTML file and extracts statistics.
 */
export function analyzeHtmlFile(fileName: string, htmlContent: string): FileAnalysis {
  const size = new Blob([htmlContent]).size;

  if (!htmlContent || htmlContent.trim() === '') {
    return {
      name: fileName,
      size,
      cssCount: 0,
      jsCount: 0,
      imageCount: 0,
      sectionCount: 0,
      totalElements: 0,
      isValid: false,
      validationError: 'File HTML kosong.'
    };
  }

  const lowercaseHtml = htmlContent.toLowerCase();
  const hasHtml = lowercaseHtml.includes('<html') || lowercaseHtml.includes('<body') || lowercaseHtml.includes('<div');

  if (!hasHtml) {
    return {
      name: fileName,
      size,
      cssCount: 0,
      jsCount: 0,
      imageCount: 0,
      sectionCount: 0,
      totalElements: 0,
      isValid: false,
      validationError: 'File tidak memiliki tag HTML/body yang valid.'
    };
  }

  try {
    const parser = new DOMParser();
    // Parse using text/html
    const doc = parser.parseFromString(htmlContent, 'text/html');

    const styleTags = doc.querySelectorAll('style');
    const cssCount = styleTags.length;

    const scriptTags = doc.querySelectorAll('script');
    const jsCount = scriptTags.length;

    const imgTags = doc.querySelectorAll('img');
    const imageCount = imgTags.length;

    const totalElements = doc.querySelectorAll('*').length;

    // Sections: canvas elements usually use structural divs or section tags
    const sectionTags = doc.querySelectorAll('section, header, footer, main, [class*="section"], [id*="section"]');
    const sectionCount = sectionTags.length;

    return {
      name: fileName,
      size,
      cssCount,
      jsCount,
      imageCount,
      sectionCount,
      totalElements,
      isValid: true
    };
  } catch (error: any) {
    return {
      name: fileName,
      size,
      cssCount: 0,
      jsCount: 0,
      imageCount: 0,
      sectionCount: 0,
      totalElements: 0,
      isValid: false,
      validationError: `Gagal membaca struktur HTML: ${error.message || error}`
    };
  }
}

/**
 * Safe XML beautifier protecting CDATA blocks containing JS or CSS.
 */
function beautifyXmlString(xml: string): string {
  const cdataBlocks: string[] = [];
  let index = 0;

  // Replace CDATA blocks with placeholders
  let processedXml = xml.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (match) => {
    cdataBlocks.push(match);
    return `__CDATA_BLOCK_${index++}__`;
  });

  let formatted = '';
  const reg = /(>)(<)(\/*)/g;
  let pad = 0;

  let tempXml = processedXml.replace(reg, '$1\r\n$2$3');
  const lines = tempXml.split('\r\n').filter(l => l.trim() !== '');

  lines.forEach((line) => {
    const trimmed = line.trim();
    let indent = 0;

    if (trimmed.match(/^<\/\w/)) {
      // Closing tag
      if (pad > 0) pad -= 1;
    } else if (trimmed.match(/^<\w[^>]*[^/]>$/) && !trimmed.match(/<[^>]+>.*<\/[^>]+>/)) {
      // Opening tag and not single-line open-closed tag
      indent = 1;
    } else {
      indent = 0;
    }

    const padding = '  '.repeat(pad);
    formatted += padding + trimmed + '\n';
    pad += indent;
  });

  // Re-insert original CDATA blocks
  for (let i = 0; i < cdataBlocks.length; i++) {
    formatted = formatted.replace(`__CDATA_BLOCK_${i}__`, cdataBlocks[i]);
  }

  return formatted.trim();
}

/**
 * Safe XML compressor preserving CDATA content.
 */
function compressXmlString(xml: string): string {
  const cdataBlocks: string[] = [];
  let index = 0;

  let processedXml = xml.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (match) => {
    cdataBlocks.push(match);
    return `__CDATA_BLOCK_${index++}__`;
  });

  processedXml = processedXml
    .replace(/<!--[\s\S]*?-->/g, '') // remove comments
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join(' ')
    .replace(/\s+/g, ' ');

  for (let i = 0; i < cdataBlocks.length; i++) {
    processedXml = processedXml.replace(`__CDATA_BLOCK_${i}__`, cdataBlocks[i]);
  }

  return processedXml.trim();
}

/**
 * Performs conversion from pure HTML to Blogger XML theme template.
 */
export function convertHtmlToBloggerXml(
  htmlContent: string,
  options: { beautify: boolean; compress: boolean } = { beautify: true, compress: false }
): string {
  // [1/6] Clean duplicate or existing doctypes
  let cleanedHtml = htmlContent.replace(/<!DOCTYPE[^>]*>/gi, '');

  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanedHtml, 'text/html');

  // Ensure head and body elements exist
  let head = doc.head;
  if (!head) {
    head = doc.createElement('head');
    doc.documentElement.insertBefore(head, doc.documentElement.firstChild);
  }

  let body = doc.body;
  if (!body) {
    body = doc.createElement('body');
    doc.documentElement.appendChild(body);
  }

  // ---- LANGKAH 1: MENANGANI JAVASCRIPT & CDATA ESCAPING ----
  const scripts = doc.querySelectorAll('script');
  scripts.forEach(script => {
    // Skip if external script with src attribute
    if (script.hasAttribute('src')) {
      return;
    }
    const jsCode = script.textContent ? script.textContent.trim() : '';
    if (jsCode) {
      if (!jsCode.startsWith('//<![CDATA[')) {
        script.textContent = `\n//<![CDATA[\n${jsCode}\n//]]>\n`;
      }
    }
  });

  // ---- LANGKAH 2: EKSTRAK STYLE KE DALAM <b:skin> ----
  let cssContent = "/* Template Custom dikonversi secara otomatis oleh Gemini Colab */\n" +
    "/* ========================================== */\n" +
    "/* BLOGGER CONTENT STYLING BY TEMPLATE BUILDER */\n" +
    "/* ========================================== */\n" +
    ".post { margin-bottom: 3rem; }\n" +
    ".post-title { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 2.25rem; font-weight: 800; color: #1e293b; line-height: 1.25; margin-bottom: 0.75rem; letter-spacing: -0.025em; }\n" +
    ".post-title a { color: #1e293b; text-decoration: none; transition: color 0.2s; }\n" +
    ".post-title a:hover { color: #fe4c6f; }\n" +
    ".post-meta { font-size: 0.875rem; color: #64748b; margin-bottom: 2rem; display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 1rem; }\n" +
    ".post-body { font-size: 1.05rem; line-height: 1.8; color: #334155; font-family: system-ui, -apple-system, sans-serif; }\n" +
    ".post-body p { margin-bottom: 1.5rem; }\n" +
    ".post-body h1, .post-body h2 { font-size: 1.75rem; font-weight: 700; color: #0f172a; margin-top: 2.5rem; margin-bottom: 1rem; letter-spacing: -0.02em; }\n" +
    ".post-body h3 { font-size: 1.4rem; font-weight: 600; color: #1e293b; margin-top: 2rem; margin-bottom: 0.75rem; }\n" +
    ".post-body img { max-width: 100%; height: auto; border-radius: 0.75rem; margin: 2rem auto; display: block; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }\n" +
    ".post-body blockquote { border-left: 4px solid #fe4c6f; background-color: #f8fafc; padding: 1.25rem 1.75rem; font-style: italic; margin: 2rem 0; border-radius: 0 0.75rem 0.75rem 0; color: #475569; }\n" +
    ".post-body ul, .post-body ol { margin: 1.5rem 0; padding-left: 1.5rem; }\n" +
    ".post-body ul { list-style-type: disc; }\n" +
    ".post-body ol { list-style-type: decimal; }\n" +
    ".post-body li { margin-bottom: 0.5rem; }\n" +
    ".post-body a { color: #fe4c6f; text-decoration: underline; text-underline-offset: 4px; font-weight: 500; }\n" +
    ".post-body a:hover { color: #e03a5a; }\n" +
    "/* Comments Container */\n" +
    "#comments { margin-top: 4rem; border-top: 1px solid #e2e8f0; padding-top: 2rem; }\n" +
    "#comments h4 { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin-bottom: 1.5rem; }\n";
  const styles = doc.querySelectorAll('style');
  styles.forEach(style => {
    if (style.textContent) {
      cssContent += "\n" + style.textContent.trim();
    }
    style.remove(); // decompose original style
  });

  const skinPlaceholder = doc.createElement('blogger-skin-placeholder');
  head.appendChild(skinPlaceholder);

  // ---- LANGKAH 3: MENYESUAIKAN TITLE DAN ALL-HEAD-CONTENT ----
  let title = doc.querySelector('title');
  if (title) {
    title.textContent = "PLACEHOLDER_BLOGGER_TITLE";
  } else {
    title = doc.createElement('title');
    title.textContent = "PLACEHOLDER_BLOGGER_TITLE";
    head.insertBefore(title, head.firstChild);
  }

  const headContentPlaceholder = doc.createElement('blogger-head-content-placeholder');
  head.appendChild(headContentPlaceholder);

  // ---- LANGKAH 4: MEMBAGI BODY MENJADI SANDWICH HEADER-FOOTER DAN MIDDLE ----
  const bodyChildren = Array.from(body.children);
  
  // Helper to check if an element is a header
  const isHeaderElement = (el: Element) => {
    const tagName = el.tagName.toLowerCase();
    const id = (el.id || '').toLowerCase();
    const className = (el.className || '').toLowerCase();
    return tagName === 'header' || 
           tagName === 'nav' || 
           id.includes('header') || 
           id.includes('nav') || 
           id.includes('menu') || 
           id.includes('navbar') || 
           id.includes('topbar') ||
           className.includes('header') || 
           className.includes('nav') || 
           className.includes('menu') || 
           className.includes('navbar') || 
           className.includes('topbar');
  };

  // Helper to check if an element is a footer
  const isFooterElement = (el: Element) => {
    const tagName = el.tagName.toLowerCase();
    const id = (el.id || '').toLowerCase();
    const className = (el.className || '').toLowerCase();
    return tagName === 'footer' || 
           id.includes('footer') || 
           id.includes('copyright') || 
           id.includes('bottom') ||
           className.includes('footer') || 
           className.includes('copyright') || 
           className.includes('bottom');
  };

  // Helper to check if an element is script or style
  const isScriptOrStyle = (el: Element) => {
    const tagName = el.tagName.toLowerCase();
    return tagName === 'script' || tagName === 'style';
  };

  let firstContentIndex = -1;
  for (let i = 0; i < bodyChildren.length; i++) {
    const child = bodyChildren[i];
    if (!isHeaderElement(child) && !isScriptOrStyle(child) && !isFooterElement(child)) {
      firstContentIndex = i;
      break;
    }
  }

  let lastContentIndex = -1;
  for (let i = bodyChildren.length - 1; i >= 0; i--) {
    const child = bodyChildren[i];
    if (!isFooterElement(child) && !isScriptOrStyle(child) && !isHeaderElement(child)) {
      lastContentIndex = i;
      break;
    }
  }

  let headerElements: Element[] = [];
  let middleElements: Element[] = [];
  let footerElements: Element[] = [];

  if (firstContentIndex !== -1 && lastContentIndex !== -1 && firstContentIndex <= lastContentIndex) {
    headerElements = bodyChildren.slice(0, firstContentIndex);
    middleElements = bodyChildren.slice(firstContentIndex, lastContentIndex + 1);
    footerElements = bodyChildren.slice(lastContentIndex + 1);
  } else {
    // Fallback if structure is unusual
    middleElements = bodyChildren;
  }

  // Bungkus konten tengah untuk halaman home saja
  const homePlaceholder = doc.createElement('blogger-home-content-placeholder');
  middleElements.forEach(elem => {
    homePlaceholder.appendChild(elem);
  });

  // Buat kontainer postingan untuk halaman single post
  const postPlaceholder = doc.createElement('blogger-post-content-placeholder');

  // Bersihkan dan susun ulang body
  body.innerHTML = '';
  headerElements.forEach(el => body.appendChild(el));
  body.appendChild(homePlaceholder);
  body.appendChild(postPlaceholder);
  footerElements.forEach(el => body.appendChild(el));

  // Tambahkan script helper untuk memperbaiki link navigasi menu saat berada di luar halaman beranda (home)
  const navFixScript = doc.createElement('script');
  navFixScript.textContent = "\n//<![CDATA[\n" +
    "function initBloggerNavigationFix() {\n" +
    "  var homepageUrl = window.location.protocol + '//' + window.location.hostname;\n" +
    "  var currentUrlClean = window.location.href.split('#')[0].split('?')[0];\n" +
    "  if (homepageUrl.endsWith('/')) {\n" +
    "    homepageUrl = homepageUrl.slice(0, -1);\n" +
    "  }\n" +
    "  if (currentUrlClean.endsWith('/')) {\n" +
    "    currentUrlClean = currentUrlClean.slice(0, -1);\n" +
    "  }\n" +
    "  var isHomepage = currentUrlClean === homepageUrl;\n" +
    "  if (!isHomepage) {\n" +
    "    var links = document.querySelectorAll('a');\n" +
    "    links.forEach(function(link) {\n" +
    "      var href = link.getAttribute('href');\n" +
    "      if (href) {\n" +
    "        if (href.startsWith('#') && href.length > 1) {\n" +
    "          link.setAttribute('href', homepageUrl + '/' + href);\n" +
    "        } else if (href === '#') {\n" +
    "          var text = (link.textContent || '').trim().toLowerCase();\n" +
    "          var isToggle = link.classList.contains('toggle') || link.getAttribute('data-toggle') || link.getAttribute('aria-controls') || link.classList.contains('menu-toggle') || link.id === 'menu-toggle' || link.classList.contains('hamburger');\n" +
    "          if (!isToggle) {\n" +
    "            link.setAttribute('href', homepageUrl + '/');\n" +
    "          }\n" +
    "        }\n" +
    "      }\n" +
    "    });\n" +
    "  }\n" +
    "}\n" +
    "if (document.readyState === 'loading') {\n" +
    "  document.addEventListener('DOMContentLoaded', initBloggerNavigationFix);\n" +
    "} else {\n" +
    "  initBloggerNavigationFix();\n" +
    "}\n" +
    "//]]>\n";
  body.appendChild(navFixScript);

  // ---- LANGKAH 5: KONVERSI MENJADI STRING & FORMAT TEMPLATE XML ----
  const serializer = new XMLSerializer();
  let rawXml = serializer.serializeToString(doc);

  // Update HTML tag namespaces for Blogger
  const htmlRegex = /<html[^>]*>/i;
  const bloggerHtmlTag = (
    "<html b:css='false' b:defaultmemegroups='true' b:version='2' class='scroll-smooth' lang='id' layoutsVersion='3' " +
    "xmlns='http://www.w3.org/1999/xhtml' " +
    "xmlns:b='http://www.google.com/2005/gml/b' " +
    "xmlns:b-data='http://www.google.com/namespaces/blogger/template/2011' " +
    "xmlns:data='http://www.google.com/2005/gml/data' " +
    "xmlns:expr='http://www.google.com/2005/gml/expr'>"
  );
  rawXml = rawXml.replace(htmlRegex, bloggerHtmlTag);

  // Replace placeholder elements with actual Blogger tags
  rawXml = rawXml.replace(/PLACEHOLDER_BLOGGER_TITLE/g, "<data:blog.pageTitle/>");

  // Blogger Head Content Placeholder Replacement
  rawXml = rawXml.replace(
    /<blogger-head-content-placeholder[^>]*>[\s\n]*<\/blogger-head-content-placeholder>/gi,
    "<b:include data='blog' name='all-head-content'/>"
  );
  rawXml = rawXml.replace(
    /<blogger-head-content-placeholder[^>]*\/>/gi,
    "<b:include data='blog' name='all-head-content'/>"
  );

  // Blogger Skin CDATA Placeholder Replacement with conditional styles to hide/show home/post views
  const skinXml = `<b:skin><![CDATA[\n${cssContent}\n]]></b:skin>\n` +
    "  <b:if cond='data:blog.pageType == &quot;item&quot; or data:blog.pageType == &quot;static_page&quot;'>\n" +
    "    <style>\n" +
    "      .blogger-home-content { display: none !important; }\n" +
    "      .post-header-line-1, .post-header-line-2, .post-header-line,\n" +
    "      .post-share-buttons, .share-buttons, .post-share-buttons-flat,\n" +
    "      .post-footer, .post-footer-line, .post-footer-line-1, .post-footer-line-2, .post-footer-line-3,\n" +
    "      .post-icons, .post-backlinks, .feed-links, .blog-feeds {\n" +
    "        display: none !important;\n" +
    "        margin: 0 !important;\n" +
    "        padding: 0 !important;\n" +
    "        border: none !important;\n" +
    "        height: 0 !important;\n" +
    "        visibility: hidden !important;\n" +
    "        opacity: 0 !important;\n" +
    "      }\n" +
    "      .post-header {\n" +
    "        margin-bottom: 0.5rem !important;\n" +
    "        padding-bottom: 0 !important;\n" +
    "        border: none !important;\n" +
    "        border-top: none !important;\n" +
    "        border-bottom: none !important;\n" +
    "      }\n" +
    "      .post-header * {\n" +
    "        border: none !important;\n" +
    "        border-top: none !important;\n" +
    "        border-bottom: none !important;\n" +
    "      }\n" +
    "      .post-body {\n" +
    "        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;\n" +
    "        margin-top: 0 !important;\n" +
    "        padding-top: 0 !important;\n" +
    "        border: none !important;\n" +
    "        border-top: none !important;\n" +
    "      }\n" +
    "      .post-body > *:first-child,\n" +
    "      .post-body > .separator:first-child,\n" +
    "      .post-body > div:first-child,\n" +
    "      .post-body > p:first-child {\n" +
    "        margin-top: 0 !important;\n" +
    "        padding-top: 0 !important;\n" +
    "      }\n" +
    "      .post-body p { margin-bottom: 1.25rem; line-height: 1.8; color: #334155; font-size: 1.05rem; }\n" +
    "      .post-body p:empty, .post-body div:empty, .post-body span:empty, .post-body p:has(> br:only-child), .post-body div:has(> br:only-child) {\n" +
    "        display: none !important;\n" +
    "        margin: 0 !important;\n" +
    "        padding: 0 !important;\n" +
    "        height: 0 !important;\n" +
    "      }\n" +
    "      .post-body h1 { font-size: 1.875rem; font-weight: 800; margin-top: 2.25rem; margin-bottom: 1.25rem; color: #0f172a; line-height: 1.35; }\n" +
    "      .post-body h2 { font-size: 1.5rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; color: #0f172a; line-height: 1.4; }\n" +
    "      .post-body h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.75rem; margin-bottom: 0.75rem; color: #0f172a; line-height: 1.4; }\n" +
    "      .post-body ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin-bottom: 1.25rem !important; }\n" +
    "      .post-body ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin-bottom: 1.25rem !important; }\n" +
    "      .post-body li { margin-bottom: 0.5rem; line-height: 1.7; color: #334155; }\n" +
    "      .post-body img { max-width: 100%; height: auto; border-radius: 0.75rem; margin: 0 auto !important; display: block; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }\n" +
    "      .post-body .separator { margin: 1rem auto !important; padding: 0 !important; line-height: 0 !important; text-align: center !important; }\n" +
    "      .post-body .separator a { margin: 0 auto !important; padding: 0 !important; display: inline-block !important; }\n" +
    "      .post-body .separator img { margin: 0 auto !important; }\n" +
    "      .post-body div[style*=\"text-align: center\"] { margin: 1rem auto !important; }\n" +
    "      .post-body br { margin: 0 !important; padding: 0 !important; }\n" +
    "      .post-body br + br, .post-body br + br + br { display: none !important; }\n" +
    "      .post-body > br:first-child, .post-body > *:first-child br:first-child { display: none !important; }\n" +
    "      .post-body a { color: #2563eb; text-decoration: underline; font-weight: 500; }\n" +
    "      .post-body a:hover { color: #1d4ed8; }\n" +
    "      .post-body blockquote { border-left: 4px solid #cbd5e1; padding-left: 1rem; font-style: italic; color: #475569; margin: 1.5rem 0; background-color: #f8fafc; padding-top: 0.5rem; padding-bottom: 0.5rem; border-top-right-radius: 0.375rem; border-bottom-right-radius: 0.375rem; }\n" +
    "      .post-body table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }\n" +
    "      .post-body th, .post-body td { border: 1px solid #e2e8f0; padding: 0.75rem; text-align: left; }\n" +
    "      .post-body th { background-color: #f1f5f9; font-weight: 600; }\n" +
    "    </style>\n" +
    "  <b:else/>\n" +
    "    <style>\n" +
    "      .blogger-post-content { display: none !important; }\n" +
    "    </style>\n" +
    "  </b:if>";
  rawXml = rawXml.replace(
    /<blogger-skin-placeholder[^>]*>[\s\n]*<\/blogger-skin-placeholder>/gi,
    skinXml
  );
  rawXml = rawXml.replace(
    /<blogger-skin-placeholder[^>]*\/>/gi,
    skinXml
  );

  // Blogger Home Content Replacement
  rawXml = rawXml.replace(
    /<blogger-home-content-placeholder[^>]*>([\s\S]*?)<\/blogger-home-content-placeholder>/gi,
    "<b:if cond='data:blog.pageType != &quot;item&quot; and data:blog.pageType != &quot;static_page&quot;'>\n" +
    "  <div class='blogger-home-content'>\n" +
    "    $1\n" +
    "  </div>\n" +
    "</b:if>"
  );

  // Blogger Post Content Replacement (Beautiful responsive container for single posts)
  const postXml = `
<b:section id='main' showaddelement='yes'>
  <b:widget id='Blog1' locked='true' title='Postingan Blog' type='Blog' visible='true'>
    <b:widget-settings>
      <b:widget-setting name='showDateHeader'>true</b:widget-setting>
      <b:widget-setting name='showShareButtons'>true</b:widget-setting>
      <b:widget-setting name='showCommentLink'>true</b:widget-setting>
      <b:widget-setting name='showAuthor'>true</b:widget-setting>
      <b:widget-setting name='showTimestamp'>true</b:widget-setting>
      <b:widget-setting name='showLabels'>true</b:widget-setting>
      <b:widget-setting name='showCommentForm'>true</b:widget-setting>
      <b:widget-setting name='showPostPages'>true</b:widget-setting>
      <b:widget-setting name='numPosts'>7</b:widget-setting>
    </b:widget-settings>
    <b:includable id='main' var='top'>
      <b:if cond='data:blog.pageType == &quot;item&quot; or data:blog.pageType == &quot;static_page&quot;'>
        <div class='blogger-post-content pt-28 pb-12 px-4 md:px-8 max-w-4xl mx-auto'>
          <div class='bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-12 font-sans antialiased text-slate-800 leading-relaxed' style='min-height: 50vh;'>
            <b:loop values='data:posts' var='post'>
              <article class='post'>
                <header class='post-header mb-2 pb-0'>
                  <h1 class='post-title text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight mb-4'><data:post.title/></h1>
                  <div class='post-meta flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-slate-500 mt-4'>
                    <b:if cond='data:post.author.name'>
                      <span class='flex items-center gap-1.5 font-medium text-slate-800'>
                        <svg class='w-4 h-4 text-slate-400' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' stroke-linecap='round' stroke-linejoin='round'></path></svg>
                        <data:post.author.name/>
                      </span>
                      <span class='text-slate-300 hidden sm:inline'>•</span>
                    </b:if>
                    <b:if cond='data:post.date'>
                      <span class='flex items-center gap-1.5'>
                        <svg class='w-4 h-4 text-slate-400' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' stroke-linecap='round' stroke-linejoin='round'></path></svg>
                        <data:post.date/>
                      </span>
                    <b:else/>
                      <b:if cond='data:post.timestamp'>
                        <span class='flex items-center gap-1.5'>
                          <svg class='w-4 h-4 text-slate-400' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' stroke-linecap='round' stroke-linejoin='round'></path></svg>
                          <data:post.timestamp/>
                        </span>
                      </b:if>
                    </b:if>
                    <b:if cond='data:post.labels'>
                      <span class='text-slate-300 hidden sm:inline'>•</span>
                      <div class='flex flex-wrap items-center gap-1.5'>
                        <svg class='w-4 h-4 text-slate-400' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' stroke-linecap='round' stroke-linejoin='round'></path></svg>
                        <div class='flex flex-wrap gap-1'>
                          <b:loop values='data:post.labels' var='label'>
                            <a expr:href='data:label.url' rel='tag' class='text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md transition-colors duration-150'>
                              <data:label.name/>
                            </a>
                          </b:loop>
                        </div>
                      </div>
                    </b:if>
                  </div>
                </header>
                <div class='post-body'>
                  <data:post.body/>
                </div>
              </article>
            </b:loop>
          </div>
        </div>
      </b:if>
    </b:includable>
  </b:widget>
</b:section>
`;
  rawXml = rawXml.replace(
    /<blogger-post-content-placeholder[^>]*>[\s\n]*<\/blogger-post-content-placeholder>/gi,
    postXml
  );
  rawXml = rawXml.replace(
    /<blogger-post-content-placeholder[^>]*\/>/gi,
    postXml
  );

  // Escaping Ampersand (&) inside URLs to make valid XML
  rawXml = rawXml.replace(/href=["']([^"']*?)(&)([^"']*?)["']/g, 'href="$1&amp;$3"');
  rawXml = rawXml.replace(/src=["']([^"']*?)(&)([^"']*?)["']/g, 'src="$1&amp;$3"');

  // Fix double escape &amp;amp; -> &amp;
  rawXml = rawXml.replace(/&amp;amp;/g, "&amp;");

  // Safe HTML Entities: XMLSerializer may produce standard entities, but let's map &nbsp; safely to avoid XML parser crash
  rawXml = rawXml.replace(/&nbsp;/gi, '&#160;');

  // Prepend strict XML declaration and standard DOCTYPE
  let finalXml = '<?xml version="1.0" encoding="UTF-8" ?>\n<!DOCTYPE html>\n' + rawXml;

  // Options: compression or beautify
  if (options.compress) {
    finalXml = compressXmlString(finalXml);
  } else if (options.beautify) {
    finalXml = beautifyXmlString(finalXml);
  }

  return finalXml;
}
