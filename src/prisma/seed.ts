import { PrismaClient} from '@prisma/client';
import * as bcrypt from 'bcrypt';

enum Role {
  ADMIN = 'ADMIN',
}

function randomDateTime() {
  var start = new Date('2023-01-01T00:00:00');
  var end = new Date('2023-12-31T23:59:59');

  var timeRange = end.getTime() - start.getTime();

  var randomTime = Math.random() * timeRange;

  var randomDateTime = new Date(start.getTime() + randomTime);

  return randomDateTime;
}

function randomPositiveInteger(x) {
  return Math.floor(Math.random() * x);
}

function randomString(length) {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;

  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

const prisma = new PrismaClient();

const deleteTableRecord = async (prisma: any) => {
  await prisma.payment.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.importNoteDetail.deleteMany();
  await prisma.importNote.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.material.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.user.deleteMany();
  await prisma.statisticsByDay.deleteMany();

  await prisma.$queryRaw`ALTER TABLE materials AUTO_INCREMENT = 1`;
  await prisma.$queryRaw`ALTER TABLE units AUTO_INCREMENT = 1`;
  await prisma.$queryRaw`ALTER TABLE statistics_by_day AUTO_INCREMENT = 1`;
};

const createUser = async (prisma) => {
  await prisma.user.create({
    data: {
      username: 'admin',
      password: await bcrypt.hash('123456', 10),
      name: 'admin',
      role: Role.ADMIN,
    },
  });
};

const createUnit = async (prisma) => {
  const units = [
    { name: 'Kilogram', short: 'Kg' },
    { name: 'Gram', short: 'g' },
    { name: 'Lít', short: 'L' },
    { name: 'Millilit', short: 'mL' },
    { name: 'Hộp', short: null },
    { name: 'Thùng', short: null },
  ];

  units.map(async (unit) => {
    await prisma.unit.create({
      data: {
        name: unit.name,
        short: unit.short,
      },
    });
  });
};

const createProvider = async (prisma) => {
  var suppliers = [
    {
      companyName: 'ABC Company',
      address: '123 Đường ABC, Thành phố X, Quốc gia Y',
      contactInfo: '+123456789, abc@company.com',
      mainContact: 'John Smith',
      productsOrServices: 'Máy móc và thiết bị công nghiệp',
    },
    {
      companyName: 'XYZ Corporation',
      address: '456 Đường XYZ, Thành phố Z, Quốc gia Y',
      contactInfo: '+987654321, xyz@corporation.com',
      mainContact: 'Jane Doe',
      productsOrServices: 'Vật liệu xây dựng',
    },
    {
      companyName: 'DEF Enterprises',
      address: '789 Đường DEF, Thành phố A, Quốc gia B',
      contactInfo: '+246813579, def@enterprises.com',
      mainContact: 'David Johnson',
      productsOrServices: 'Dịch vụ kỹ thuật số',
    },
    {
      companyName: 'GHI Industries',
      address: '1011 Đường GHI, Thành phố C, Quốc gia D',
      contactInfo: '+135792468, ghi@industries.com',
      mainContact: 'Emily Brown',
      productsOrServices: 'Linh kiện điện tử',
    },
    {
      companyName: 'LMN Supplies',
      address: '1213 Đường LMN, Thành phố E, Quốc gia F',
      contactInfo: '+369258147, lmn@supplies.com',
      mainContact: 'Michael White',
      productsOrServices: 'Vật liệu và thiết bị nông nghiệp',
    },
    {
      companyName: 'PQR Solutions',
      address: '1415 Đường PQR, Thành phố G, Quốc gia H',
      contactInfo: '+147258369, pqr@solutions.com',
      mainContact: 'Sarah Wilson',
      productsOrServices: 'Phần mềm và giải pháp công nghệ thông tin',
    },
    {
      companyName: 'UVW Enterprises',
      address: '1617 Đường UVW, Thành phố I, Quốc gia J',
      contactInfo: '+258369147, uvw@enterprises.com',
      mainContact: 'Kevin Lee',
      productsOrServices: 'Dịch vụ tài chính',
    },
    {
      companyName: 'RST Manufacturing',
      address: '1819 Đường RST, Thành phố K, Quốc gia L',
      contactInfo: '+369147258, rst@manufacturing.com',
      mainContact: 'Lisa Taylor',
      productsOrServices: 'Sản xuất và gia công',
    },
    {
      companyName: 'OPQ Corporation',
      address: '2021 Đường OPQ, Thành phố M, Quốc gia N',
      contactInfo: '+123789456, opq@corporation.com',
      mainContact: 'Robert Clark',
      productsOrServices: 'Dịch vụ tư vấn',
    },
    {
      companyName: 'STU Logistics',
      address: '2223 Đường STU, Thành phố O, Quốc gia P',
      contactInfo: '+456123789, stu@logistics.com',
      mainContact: 'Jessica Martinez',
      productsOrServices: 'Dịch vụ vận chuyển và logistics',
    },
  ];
  const user = await prisma.user.findFirst();
  suppliers.map(async (supplier) => {
    const [phone, email] = supplier.contactInfo.split(',');
    await prisma.provider.create({
      data: {
        name: supplier.companyName,
        created_by: user.id,
        last_updated_by: user.id,
        phone: phone,
        email: email,
        address: supplier.address,
      },
    });
  });
};

const createCategories = async (prisma) => {
  const categories = ['Cà phê', 'Trà', 'Sinh tố'];
  categories.map(async (category) => {
    return await prisma.category.create({
      data: {
        name: category,
      },
    });
  });
};

const createMaterial = async (prisma) => {
  const user = await prisma.user.findFirst();
  for (let i = 0; i < 10; i++) {
    await prisma.material.create({
      data: {
        name: randomString(16),
        stock_quantity: randomPositiveInteger(1000),
        created_by: user.id,
        last_updated_by: user.id,
        expiration_date: randomDateTime(),
        latest_import_date: randomDateTime(),
        latest_export_date: randomDateTime(),
        unit_id: 1,
      },
    });
  }
};

const createPayment = async (prisma) => {
  const paymentType = ['Trả tiền mặt', 'Thanh toán qua thẻ ngân hàng'];

  await prisma.payment.createMany({
    data: paymentType.map((type) => {
      return { type: type };
    }),
  });
};

const createDayStatistic = async (prisma) => {
  const start = new Date('2024-01-01');
  const end = new Date('2024-05-31');
  let count = 0;
  while (start !== end && count <= 1000) {
    await prisma.statisticsByDay.create({
      data: {
        statistics_date: start,
        number_of_order: randomPositiveInteger(1000),
        revenue: randomPositiveInteger(10000000),
      },
    });
    start.setDate(start.getDate() + 1);
    count++;
  }
};

async function main() {
  try {
    await prisma.$transaction(async (p) => {
      await deleteTableRecord(p);
      await createUser(p);
      await createUnit(p);
      await createProvider(p);
      await createCategories(p);
      await createMaterial(p);
      await createPayment(p);
      await createDayStatistic(p);
    });
  } catch (error) {
    console.log(error);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
