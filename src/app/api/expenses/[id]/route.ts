import { NextRequest, NextResponse } from "next/server";

// ==========================================
// Method: DELETE
// ==========================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. รอรับค่า id จาก Promise
    const { id } = await params;

    // 2. นำ id ไปใช้งาน (วางโค้ดลบข้อมูลเดิมของคุณตรงนี้)
    console.log("Deleting expense ID:", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// ==========================================
// Method: GET (ถ้ามี)
// ==========================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // วางโค้ดดึงข้อมูลเดิมของคุณตรงนี้
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// ==========================================
// Method: PUT / PATCH (ถ้ามี)
// ==========================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // วางโค้ดอัปเดตข้อมูลเดิมของคุณตรงนี้
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}