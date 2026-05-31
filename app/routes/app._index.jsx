import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { generateProductContent } from "../gemini.server";
import { generateImage } from "../image.server";
import  prisma  from "../db.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }) => {

  const { admin } = await authenticate.admin(request);
const formData = await request.formData();

const actionType =
  formData.get("actionType");

let aiData;

if (actionType === "preview") {
  const productIdea =
    formData.get("productIdea");

  aiData =
    await generateProductContent(
      productIdea
    );

  const imageUrl =
    await generateImage(
      aiData.imagePrompt
    );

  aiData.imageUrl = imageUrl;

  return { aiData };
}

aiData = JSON.parse(
  formData.get("aiData")
);




  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
  productCreate(product: $product) {
  product {
    id
    title
  }
  userErrors {
    field
    message
  }
}
      }`,
    {
      variables: {
    product: {
  title: aiData.title,
  descriptionHtml: aiData.description,
  tags: aiData.tags.split(",").map(tag => tag.trim()),
  productType: aiData.productType,
  vendor: aiData.vendor,
  seo: {
  title: aiData.seoTitle,
  description: aiData.seoDescription,
},
    },
      },
    },
  );
  const responseJson = await response.json();

  const product = responseJson.data.productCreate.product;
  if (product?.id && aiData.imageUrl) {
  const mediaResponse = await admin.graphql(
    `#graphql
    mutation productCreateMedia(
      $productId: ID!
      $media: [CreateMediaInput!]!
    ) {
      productCreateMedia(
        productId: $productId
        media: $media
      ) {
        media {
          alt
          mediaContentType
        }
        mediaUserErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        media: [
          {
            originalSource: aiData.imageUrl,
            mediaContentType: "IMAGE",
            alt: aiData.title,
          },
        ],
      },
    }
  );

  const mediaJson = await mediaResponse.json();

  console.log(
    "MEDIA:",
    JSON.stringify(mediaJson, null, 2)
  );
}

await prisma.generation.create({
  data: {
    title: aiData.title,
    description: aiData.description,
    tags: aiData.tags,
    imageUrl: aiData.imageUrl,
    imagePrompt: aiData.imagePrompt,
    vendor: aiData.vendor,
    productType: aiData.productType,
    seoTitle: aiData.seoTitle,
    seoDescription: aiData.seoDescription,
  },
});

return {
  product,
  aiData,
};

};

export default function Index() {
  const [productIdea, setProductIdea] = useState("");
  const [previewData, setPreviewData] =  useState(null);
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";

  useEffect(() => {
    if (fetcher.data?.product?.id) {
      shopify.toast.show("Product created");
    }
  }, [fetcher.data?.product?.id, shopify]);

useEffect(() => {
  if (fetcher.data?.aiData) {
    setPreviewData(fetcher.data.aiData);
  }
}, [fetcher.data]);

const generatePreview = () =>
  fetcher.submit(
    {
      productIdea,
      actionType: "preview",
    },
    { method: "POST" }
  );

const createProduct = () =>
  fetcher.submit(
    {
      actionType: "create",
      aiData: JSON.stringify(previewData),
    },
    { method: "POST" }
  );

  return (
    <s-page heading="AI Product Generator">
    <s-box padding="base">
  <input
    type="text"
    value={productIdea}
    onChange={(e) =>
      setProductIdea(e.target.value)
    }
    placeholder="Enter product idea"
    style={{
      width: "100%",
      padding: "10px",
      fontSize: "16px",
    }}
  />
</s-box>
      <s-button slot="primary-action" onClick={generatePreview}>
       Generate AI Product
      </s-button>
{fetcher.data?.aiData && (
  <>
    <s-section heading="AI Preview">
      <strong>Image Prompt:</strong>
        <img
    src={fetcher.data.aiData.imageUrl}
    alt={fetcher.data.aiData.title}
    style={{
      width: "100%",
      maxWidth: "500px",
      borderRadius: "12px",
    }}
  />
      <p>
        <strong>Image Prompt:</strong>
        {fetcher.data.aiData.imagePrompt}
      </p>

      <p>
        <strong>Title:</strong>{" "}
        {fetcher.data.aiData.title}
      </p>

      <p>
        <strong>Description:</strong>{" "}
        {fetcher.data.aiData.description}
      </p>

      <p>
        <strong>Tags:</strong>{" "}
        {fetcher.data.aiData.tags}
      </p>
      <p>
  <strong>Price:</strong>{" "}
  {fetcher.data.aiData.price}
</p>

<p>
  <strong>Vendor:</strong>{" "}
  {fetcher.data.aiData.vendor}
</p>

<p>
  <strong>Product Type:</strong>{" "}
  {fetcher.data.aiData.productType}
</p>

<p>
  <strong>SEO Title:</strong>{" "}
  {fetcher.data.aiData.seoTitle}
</p>

<p>
  <strong>SEO Description:</strong>{" "}
  {fetcher.data.aiData.seoDescription}
</p>
    </s-section>

    <div style={{ marginTop: "20px" }}>
      <button onClick={createProduct}>
        Create Product
      </button>
    </div>
  </>
)}
    </s-page>

    
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
