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

  return { generations };
};

export default function History() {
  const { generations } = useLoaderData();

  return (
    <s-page heading="Generation History">
      {generations.map((item) => (
        <s-box
          key={item.id}
          padding="base"
          style={{
            marginBottom: "20px",
          }}
        >
          <h3>{item.title}</h3>

          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.title}
              style={{
                width: "200px",
                borderRadius: "8px",
              }}
            />
          )}

          <p>{item.description}</p>

          <p>
            <strong>Tags:</strong>{" "}
            {item.tags}
          </p>

          <p>
            <strong>Date:</strong>{" "}
            {new Date(
              item.createdAt
            ).toLocaleString()}
          </p>
        </s-box>
      ))}
    </s-page>
  );
}