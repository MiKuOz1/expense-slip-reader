import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // นำเข้า Prisma สำหรับเชื่อมต่อ Database

// ==========================================
// Method: GET (ระบบกู้/ดึงข้อมูลสลิป 1 รายการ)
// ==========================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ค้นหาข้อมูลใน Database ด้วย Prisma
    const expense = await prisma.expense.findUnique({
      where: { id: id },
    });

    if (!expense) {
      return NextResponse.json({ error: "ไม่พบข้อมูลรายการนี้" }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error("GET Expense Error:", error);
    return NextResponse.json({ error: "ดึงข้อมูลไม่สำเร็จ" }, { status: 500 });
  }
}

// ==========================================
// Method: PUT / PATCH (ระบบอัปเดต/แก้ไขข้อมูล)
// ==========================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // อัปเดตข้อมูลใน Database
    const updatedExpense = await prisma.expense.update({
      where: { id: id },
      data: body,
    });

    return NextResponse.json({ success: true, expense: updatedExpense });
  } catch (error) {
    console.error("UPDATE Expense Error:", error);
    return NextResponse.json({ error: "อัปเดตข้อมูลไม่สำเร็จ" }, { status: 500 });
  }
}

// ==========================================
// Method: DELETE (ระบบลบข้อมูล)
// ==========================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ลบข้อมูลออกจาก Database
    await prisma.expense.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Expense Error:", error);
    return NextResponse.json({ error: "ลบข้อมูลไม่สำเร็จ" }, { status: 500 });
  }
}