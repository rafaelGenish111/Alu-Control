require('dotenv').config();
const mongoose = require('mongoose');
const Supplier = require('./models/Supplier');

const suppliers = [
  {
    name: "Aluminios Españoles S.A.",
    contactPerson: "Juan Pérez",
    phone: "+34 911 223 344",
    email: "ventas@aluminiospain.es",
    leadTime: 10,
    category: "Aluminum"
  },
  {
    name: "Vidrios y Cristales BCN",
    contactPerson: "Laura Gómez",
    phone: "+34 933 445 566",
    email: "info@vidriosbcn.com",
    leadTime: 5,
    category: "Glass"
  },
  {
    name: "Herrajes del Sur",
    contactPerson: "Antonio Ruiz",
    phone: "+34 954 112 233",
    email: "pedidos@herrajessur.es",
    leadTime: 3,
    category: "Hardware"
  },
  {
    name: "Perfiles Metálicos Valencia",
    contactPerson: "Carlos Sánchez",
    phone: "+34 963 889 900",
    email: "carlos@perfilesvalencia.com",
    leadTime: 12,
    category: "Aluminum"
  },
  {
    name: "Cristalería Moderna",
    contactPerson: "Sofia Diaz",
    phone: "+34 612 345 678",
    email: "contacto@cristaleriamoderna.es",
    leadTime: 7,
    category: "Glass"
  },
  {
    name: "Suministros Industriales Bilbao",
    contactPerson: "Miguel Torres",
    phone: "+34 944 556 677",
    email: "miguel@suministrosbilbao.com",
    leadTime: 2,
    category: "Other"
  },
  {
    name: "Extrusiones de Aluminio Madrid",
    contactPerson: "Elena Martinez",
    phone: "+34 915 667 788",
    email: "elena@extrusionesmadrid.es",
    leadTime: 14,
    category: "Aluminum"
  },
  {
    name: "Soluciones en Vidrio",
    contactPerson: "David Romero",
    phone: "+34 622 998 877",
    email: "david@solucionesvidrio.com",
    leadTime: 6,
    category: "Glass"
  }
];

const seedSuppliers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔌 Connected to DB');

    // אופציונלי: מחיקת ספקים קיימים כדי למנוע כפילויות בהרצה חוזרת
    // await Supplier.deleteMany({}); 
    // console.log('🗑️ Existing suppliers cleared');

    for (const supplierData of suppliers) {
      // בדיקה אם הספק כבר קיים לפי שם (כדי למנוע שגיאות duplicate key)
      const exists = await Supplier.findOne({ name: supplierData.name });
      if (!exists) {
        await Supplier.create(supplierData);
        console.log(`✅ Created supplier: ${supplierData.name}`);
      } else {
        console.log(`⚠️ Supplier already exists: ${supplierData.name}`);
      }
    }

    console.log('🎉 Supplier seeding completed!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedSuppliers();