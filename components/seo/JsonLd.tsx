/**
 * Injects one or more Schema.org JSON-LD graphs into the document.
 * Rendered server-side; safe because the payload is our own structured data.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const graphs = Array.isArray(data) ? data : [data];
  return (
    <>
      {graphs.map((graph, i) => (
        <script
          key={i}
          type="application/ld+json"
          // JSON.stringify escapes </script> sequences adequately for our own data.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
        />
      ))}
    </>
  );
}
