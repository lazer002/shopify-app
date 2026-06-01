import prisma from "../db.server";

export const action = async ({ request }) => {
  console.log("🔥 PRODUCTS DELETE WEBHOOK HIT");

  const webhook = await request.json();

  await prisma.productEvent.create({
    data: {
      productId: webhook.id.toString(),
      eventType: "DELETE",
    },
  });
console.log("✅ Delete event saved");
  console.log(JSON.stringify(webhook, null, 2));

  return new Response();
};

export default function() {
  return null;
}