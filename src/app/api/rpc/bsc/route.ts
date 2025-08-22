import { NextResponse } from "next/server";

const BSC_RPC_URL = process.env.BSC_RPC_URL;
const BSC_FALLBACK_RPC_URL = process.env.BSC_FALLBACK_RPC_URL;

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (origin !== process.env.NEXT_PUBLIC_APP_URL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    let rpcResponse = await fetch(BSC_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // Failover if the primary provider fails
    if (!rpcResponse.ok && BSC_FALLBACK_RPC_URL) {
      console.warn("Primary BSC RPC failed. Switching to fallback.");
      rpcResponse = await fetch(BSC_FALLBACK_RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    if (!rpcResponse.ok) {
      console.error(
        "BSC RPC call failed:",
        rpcResponse.status,
        rpcResponse.statusText
      );
      return NextResponse.json(
        {
          error: `BSC RPC call failed: ${rpcResponse.status} ${rpcResponse.statusText}`,
        },
        { status: rpcResponse.status }
      );
    }

    const data = await rpcResponse.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("BSC RPC Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
