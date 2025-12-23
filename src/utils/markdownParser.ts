// Simple markdown to HTML converter
// Supports: **bold**, *italic*, ## headings, • lists, [link](url), newlines

export const parseMarkdown = (text: string): string => {
    if (!text) return '';

    let html = text;

    // Escape HTML special characters first (except what we'll add)
    html = html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Bold: **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic: *text*
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Headings: ## Heading
    html = html.replace(/^## (.+)$/gm, '<h3 class="md-heading">$1</h3>');
    html = html.replace(/^### (.+)$/gm, '<h4 class="md-subheading">$1</h4>');

    // Bullet points: • item or - item
    html = html.replace(/^[•-] (.+)$/gm, '<li>$1</li>');

    // Wrap consecutive <li> in <ul> and remove newlines inside
    html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
        // Remove newlines between list items
        const cleanedMatch = match.replace(/\n/g, '');
        return '<ul class="md-list">' + cleanedMatch + '</ul>';
    });

    // Links: [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Line breaks - but not inside already processed elements
    html = html.replace(/\n/g, '<br/>');

    // Clean up <br/> after/before headings and lists
    html = html.replace(/<\/h3><br\/>/g, '</h3>');
    html = html.replace(/<\/h4><br\/>/g, '</h4>');
    html = html.replace(/<\/ul><br\/>/g, '</ul>');
    html = html.replace(/<br\/><h3/g, '<h3');
    html = html.replace(/<br\/><h4/g, '<h4');
    html = html.replace(/<br\/><ul/g, '<ul');

    return html;
};

