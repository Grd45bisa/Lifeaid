/**
 * Simple Markdown to HTML parser
 * Supports: Bold, Italic, Heading, List, Link, Table
 */

export const parseMarkdown = (markdown: string): string => {
    if (!markdown) return '';

    let html = markdown
        // Escape HTML
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

        // Tables
        .replace(/(\|[^\n]+\|\r?\n)((?:\|:?[-]+:?)+\|)(\r?\n(?:\|[^\n]+\|\r?\n?)+)/g, (_match, header, _separator, body) => {
            const headers = header.trim().split('|').filter((cell: string) => cell.trim().length > 0);
            const bodyRows = body.trim().split('\n');

            let tableHtml = '<table class="preview-table"><thead><tr>';
            headers.forEach((h: string) => {
                tableHtml += `<th>${h.trim()}</th>`;
            });
            tableHtml += '</tr></thead><tbody>';

            bodyRows.forEach((row: string) => {
                const cleanCells = row.split('|');
                if (cleanCells[0].trim() === '') cleanCells.shift();
                if (cleanCells[cleanCells.length - 1].trim() === '') cleanCells.pop();

                tableHtml += '<tr>';
                cleanCells.forEach((c: string) => {
                    tableHtml += `<td>${c.trim()}</td>`;
                });
                tableHtml += '</tr>';
            });
            tableHtml += '</tbody></table>';
            return tableHtml;
        })

        // Headings
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')

        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')

        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<em>$1</em>')

        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')

        // Unordered List
        .replace(/^\s*[\-\*] (.*$)/gm, '<li>$1</li>')
        .replace(/((?:<li>.*<\/li>\s*)+)/g, '<ul>$1</ul>')

        // Remove newlines after block elements to prevent double spacing
        .replace(/(<\/h[1-6]>|<\/ul>|<\/ol>|<\/table>|<\/blockquote>)\s*\n/g, '$1')

        // Line breaks (convert remaining newlines to <br>)
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');

    return html;
};
