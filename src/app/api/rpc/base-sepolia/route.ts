import { NextResponse } from "next/server";

const BASE_SEPOLIA_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL;
const BASE_SEPOLIA_FALLBACK_RPC_URL = process.env.BASE_SEPOLIA_FALLBACK_RPC_URL;

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (origin !== process.env.NEXT_PUBLIC_APP_URL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    let rpcResponse = await fetch(BASE_SEPOLIA_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // Failover if the primary provider fails
    if (!rpcResponse.ok && BASE_SEPOLIA_FALLBACK_RPC_URL) {
      console.warn("Primary Base Sepolia RPC failed. Switching to fallback.");
      rpcResponse = await fetch(BASE_SEPOLIA_FALLBACK_RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    if (!rpcResponse.ok) {
      console.error(
        "Base Sepolia RPC call failed:",
        rpcResponse.status,
        rpcResponse.statusText
      );
      return NextResponse.json(
        {
          error: `Base Sepolia RPC call failed: ${rpcResponse.status} ${rpcResponse.statusText}`,
        },
        { status: rpcResponse.status }
      );
    }

    const data = await rpcResponse.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Base Sepolia RPC Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
