import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const targets = ['Raylan', 'Azzam', 'Sukari'];

    // Get all models
    const models = (prisma as any)._runtimeDataModel.models;
    const modelNames = Object.keys(models);

    console.log(`Searching across ${modelNames.length} models...`);

    for (const modelName of modelNames) {
        const modelKey = modelName.charAt(0).toLowerCase() + modelName.slice(1);
        if (!(prisma as any)[modelKey]) continue;

        try {
            const records = await (prisma as any)[modelKey].findMany();
            records.forEach((record: any) => {
                const str = JSON.stringify(record).toLowerCase();
                targets.forEach(t => {
                    if (str.includes(t.toLowerCase())) {
                        console.log(`FOUND "${t}" in model ${modelName}:`, record);
                    }
                });
            });
        } catch (e) {
            // Some models might not be queryable this way
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
