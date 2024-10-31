/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  MY_BUCKET: R2Bucket;
  //
  // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  MY_SERVICE: Fetcher;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    // Parse the request URL
    const url = new URL(request.url);

    // Route to "Home" >> "/"
    if (url.pathname === "/" || url.pathname === "") {
      const html = `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Products</title>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              padding: 8px;
              border: 1px solid #ddd;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
          </style>
        </head>
        <body>
          <h1>Homepage</h1>
          <a href="/api/products">Products</a>
        </body>
        </html>`;

      // Return the Homepage
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // GET
    if (url.pathname === "/api/products") {
      try {
        // Sample product data
        const response = await fetch(
          "https://02557f4d-8f03-405d-a4e7-7a6483d26a04.mock.pstmn.io/get",
          // "https://02557f4d-8f03-405d-a4e7-7a6483d26a04.mock.pstmn.io/getProducts",
          {
            method: "GET",
            headers: {
              "Content-Type": "text/html",
            },
          }
        );

        //   Check if fetch is unsuccessful
        if (!response.ok) {
          return new Response("Error fetching data:", {
            status: response.status,
          });
        }

        const res: any = await response.json();
        const data = res.products;

        if (!Array.isArray(data)) {
          return new Response("Error data format!", {
            status: 500,
          });
        }

        const dataRows = data
          .map((item) => {
            // id, title + variants, tags, created, updated, sku
            console.log(item);

            const variantTitle = item.variants.map(
              (variant: any) => variant.title
            );
            const variantSku = item.variants.map((variant: any) => variant.sku);

            return `<tr>
              <td>${item.id}</td>
              <td>${variantTitle}</td>
              <td>${item.tags}</td>
              <td>${item.created_at}</td>
              <td>${item.updated_at}</td>
              <td>${variantSku}</td>
            </tr>`;
          })
          .join("");

        const html = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Products</title>
            <style>
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                padding: 8px;
                border: 1px solid #ddd;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
              }
            </style>
          </head>
          <body>
            <h1>Product List</h1>
            <form id="productForm" action="https://02557f4d-8f03-405d-a4e7-7a6483d26a04.mock.pstmn.io/getProducts" method="POST">
            <label for="title">Title</label>
            <input type="text" id="title" name="title" required placeholder="Enter product title" />

            <label for="tags">Tags (comma-separated)</label>
            <input type="text" id="tags" name="tags" placeholder="E.g., electronics, gadget" />
            <button type="submit">Add Product</button>
            </form>
            <br />
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Tags</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                  <th>SKU</th>
                </tr>
              </thead>
              <tbody>
              ${dataRows}
              </tbody>
            </table>
          </body>
          </html>
        `;

        // Return the HTML as a Response
        return new Response(html, {
          headers: { "Content-Type": "text/html" },
        });
      } catch (error) {
        return new Response("Failed to fetch products!", { status: 500 });
      }
    }

    // POST
    if (url.pathname === "api/products" && request.method === "POST") {
      const response = await fetch(
        "https://02557f4d-8f03-405d-a4e7-7a6483d26a04.mock.pstmn.io/getProducts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const html = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Products</title>
            <style>
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                padding: 8px;
                border: 1px solid #ddd;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
              }
            </style>
          </head>
          <body>
            <h1>Product Add</h1>
            ${response}
          </body>
          </html>
        `;

      // Return the HTML as a Response
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // Default response for other routes
    return new Response("Not Found", { status: 404 });
  },
};
