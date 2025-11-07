import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const code = searchParams.get("code");

    try {
        let apiUrl;
        const baseUrl =
            process.env.WILAYAH_API_BASE || "https://wilayah.id/api";

        if (type === "provinces") {
            apiUrl = `${baseUrl}/provinces.json`;
        } else if (type === "regencies" && code) {
            apiUrl = `${baseUrl}/regencies/${code}.json`;
        } else if (type === "districts" && code) {
            apiUrl = `${baseUrl}/districts/${code}.json`;
        } else if (type === "villages" && code) {
            apiUrl = `${baseUrl}/villages/${code}.json`;
        } else {
            return NextResponse.json(
                { error: "Invalid parameters" },
                { status: 400 },
            );
        }

        const res = await fetch(apiUrl);
        const data = await res.json();
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json(
            { error: "Failed to fetch data" },
            { status: 500 },
        );
    }
}
