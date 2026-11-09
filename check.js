const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const jurusan = await prisma.jurusan.findMany();
    const perusahaan = await prisma.perusahaan.findMany();

    console.log("Jurusan:", jurusan.map(j => ({ id: j.id, nama: j.nama })));
    console.log("Perusahaan:", perusahaan.map(p => ({ id: p.id, nama: p.nama })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
