import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  const generations =
    await prisma.generation.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

  const deletedProducts =
    await prisma.productEvent.findMany({
      where: {
        eventType: "DELETE",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  return {
    generations,
    deletedProducts,
  };
};

export default function History() {
  const {
    generations,
    deletedProducts,
  } = useLoaderData();

  const history = [
    ...generations.map((g) => ({
      type: "GENERATION",
      createdAt: g.createdAt,
      data: g,
    })),

    ...deletedProducts.map((d) => ({
      type: "DELETE",
      createdAt: d.createdAt,
      data: d,
    })),
  ].sort(
    (a, b) =>
      new Date(b.createdAt) -
      new Date(a.createdAt)
  );

  return (
    <s-page heading="History">
      {history.map((item) => {
        if (item.type === "GENERATION") {
          const generation = item.data;

          return (
            <s-box
              key={`generation-${generation.id}`}
              padding="base"
              style={{
                marginBottom: "20px",
              }}
            >
              <h3>
                ✨ Generated Product
              </h3>

              <h4>{generation.title}</h4>

              {generation.imageUrl && (
                <img
                  src={generation.imageUrl}
                  alt={generation.title}
                  style={{
                    width: "200px",
                    borderRadius: "8px",
                  }}
                />
              )}

              <p>
                {generation.description}
              </p>

              <p>
                <strong>Tags:</strong>{" "}
                {generation.tags}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(
                  generation.createdAt
                ).toLocaleString()}
              </p>
            </s-box>
          );
        }

        const deleted = item.data;

        return (
          <s-box
            key={`delete-${deleted.id}`}
            padding="base"
            style={{
              marginBottom: "20px",
            }}
          >
            <h3>
              ❌ Product Deleted
            </h3>

            <p>
              <strong>Product ID:</strong>{" "}
              {deleted.productId}
            </p>

            <p>
              <strong>Date:</strong>{" "}
              {new Date(
                deleted.createdAt
              ).toLocaleString()}
            </p>
          </s-box>
        );
      })}
    </s-page>
  );
}