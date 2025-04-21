import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { clerkId, imageUrl } = await request.json();

    if (!clerkId || !imageUrl) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const response = await sql`
      INSERT INTO images ( 
        clerk_id,
        image_url
      ) 
      VALUES (
        ${clerkId},
        ${imageUrl}
     );`;

    return new Response(JSON.stringify({ data: response }), {
      status: 201,
    });

  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}