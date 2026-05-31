export const action = async ({ request }) => {
  console.log("🔥 PRODUCTS DELETE WEBHOOK HIT");

  const webhook = await request.json();

  console.log(JSON.stringify(webhook, null, 2));

  return new Response();
};

export default function() {
  return null;
}