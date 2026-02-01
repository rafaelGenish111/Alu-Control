require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Supplier = require('./models/Supplier');
const Order = require('./models/Order');

// 30 שמות ישראליים ללקוחות
const customerNames = [
  'דוד כהן', 'שרה לוי', 'יוסף ישראלי', 'רחל אברהם', 'משה דוד',
  'מרים כהן', 'אברהם לוי', 'רבקה ישראלי', 'יצחק אברהם', 'לאה דוד',
  'יעקב כהן', 'דינה לוי', 'בנימין ישראלי', 'תמר אברהם', 'יונתן דוד',
  'רות כהן', 'אליהו לוי', 'חיה ישראלי', 'שלמה אברהם', 'אסתר דוד',
  'דניאל כהן', 'נעמי לוי', 'גד ישראלי', 'מיכל אברהם', 'עמית דוד',
  'נועה כהן', 'אור לוי', 'אלון ישראלי', 'טל אברהם', 'רונן דוד'
];

// 30 כתובות ישראליות
const addresses = [
  'רחוב הרצל 15, תל אביב', 'שדרות רוטשילד 42, תל אביב', 'רחוב דיזנגוף 88, תל אביב',
  'רחוב בן יהודה 12, ירושלים', 'רחוב יפו 25, ירושלים', 'רחוב המלך ג\'ורג\' 7, ירושלים',
  'רחוב הרצל 30, חיפה', 'שדרות בן גוריון 18, חיפה', 'רחוב הנמל 5, חיפה',
  'רחוב ויצמן 22, רמת גן', 'רחוב ביאליק 10, רמת גן', 'רחוב ז\'בוטינסקי 45, רמת גן',
  'רחוב הרצל 8, פתח תקווה', 'רחוב רוטשילד 33, פתח תקווה', 'רחוב חובבי ציון 20, פתח תקווה',
  'רחוב הרצל 50, ראשון לציון', 'רחוב רוטשילד 15, ראשון לציון', 'רחוב ז\'בוטינסקי 28, ראשון לציון',
  'רחוב הרצל 12, אשדוד', 'רחוב רוטשילד 7, אשדוד', 'רחוב בן גוריון 40, אשדוד',
  'רחוב הרצל 25, באר שבע', 'רחוב רוטשילד 18, באר שבע', 'רחוב בן גוריון 30, באר שבע',
  'רחוב הרצל 35, נתניה', 'רחוב רוטשילד 22, נתניה', 'רחוב ז\'בוטינסקי 14, נתניה',
  'רחוב הרצל 20, רחובות', 'רחוב רוטשילד 11, רחובות', 'רחוב בן גוריון 25, רחובות'
];

// 30 מספרי טלפון ישראליים
const phones = [
  '050-1234567', '050-2345678', '050-3456789', '050-4567890', '050-5678901',
  '052-1234567', '052-2345678', '052-3456789', '052-4567890', '052-5678901',
  '053-1234567', '053-2345678', '053-3456789', '053-4567890', '053-5678901',
  '054-1234567', '054-2345678', '054-3456789', '054-4567890', '054-5678901',
  '055-1234567', '055-2345678', '055-3456789', '055-4567890', '055-5678901',
  '058-1234567', '058-2345678', '058-3456789', '058-4567890', '058-5678901'
];

// 30 שמות עובדים
const employeeNames = [
  'יוסי כהן', 'מיכל לוי', 'אור ישראלי', 'טל אברהם', 'רונן דוד',
  'נועה כהן', 'עמית לוי', 'דניאל ישראלי', 'שרה אברהם', 'יונתן דוד',
  'תמר כהן', 'אלון לוי', 'מיכל ישראלי', 'דוד אברהם', 'רות דוד',
  'אבי כהן', 'ליאור לוי', 'עדי ישראלי', 'רועי אברהם', 'מור דוד',
  'איתי כהן', 'עומר לוי', 'אליה ישראלי', 'יובל אברהם', 'גל דוד',
  'רומי כהן', 'ליאם לוי', 'ארי ישראלי', 'אופיר אברהם', 'אליאור דוד'
];

// 30 שמות ספקים ישראליים (ייחודיים – ללא כפילויות)
const supplierNames = [
  'אלומיניום ישראל בע"מ', 'זכוכית דוד ושות\'', 'חומרה כהן בע"מ', 'צבעים לוי בע"מ',
  'פרופילים ישראלי בע"מ', 'זכוכית אברהם בע"מ', 'אלומיניום דוד בע"מ', 'חומרה כהן ושות\'',
  'צבעים אברהם בע"מ', 'פרופילים דוד בע"מ', 'זכוכית כהן בע"מ', 'אלומיניום לוי בע"מ',
  'חומרה ישראלי בע"מ', 'צבעים דוד בע"מ', 'פרופילים כהן בע"מ', 'זכוכית לוי בע"מ',
  'אלומיניום אברהם בע"מ', 'חומרה דוד בע"מ', 'צבעים ישראלי בע"מ', 'פרופילים לוי בע"מ',
  'זכוכית ישראלי בע"מ', 'אלומיניום כהן בע"מ', 'חומרה אברהם בע"מ', 'צבעים כהן בע"מ',
  'פרופילים אברהם בע"מ', 'זכוכית דוד בע"מ', 'אלומיניום ישראלי בע"מ', 'חומרה לוי בע"מ',
  'צבעים לוי ושות\' בע"מ', 'פרופילים ישראלי דוד בע"מ'
];

// 30 שמות אנשי קשר לספקים
const contactPersons = [
  'דוד כהן', 'שרה לוי', 'יוסף ישראלי', 'רחל אברהם', 'משה דוד',
  'מרים כהן', 'אברהם לוי', 'רבקה ישראלי', 'יצחק אברהם', 'לאה דוד',
  'יעקב כהן', 'דינה לוי', 'בנימין ישראלי', 'תמר אברהם', 'יונתן דוד',
  'רות כהן', 'אליהו לוי', 'חיה ישראלי', 'שלמה אברהם', 'אסתר דוד',
  'דניאל כהן', 'נעמי לוי', 'גד ישראלי', 'מיכל אברהם', 'עמית דוד',
  'נועה כהן', 'אור לוי', 'אלון ישראלי', 'טל אברהם', 'רונן דוד'
];

const DEFAULT_TENANT_ID = 'default_glass_dynamics';
const TENANT_ID = process.env.TENANT_ID || DEFAULT_TENANT_ID;
const roles = ['super_admin', 'admin', 'office', 'production', 'installer'];
const languages = ['en', 'es', 'he'];
const supplierCategories = ['Aluminum', 'Glass', 'Hardware', 'Other'];
const regions = ['תל אביב', 'ירושלים', 'חיפה', 'רמת גן', 'פתח תקווה', 'ראשון לציון', 'אשדוד', 'באר שבע', 'נתניה', 'רחובות'];

const seedDemo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔌 Connected to DB for demo seeding...');

    // מחיקת נתונים קיימים (אופציונלי - ניתן להסיר אם רוצים לשמור נתונים קיימים)
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Supplier.deleteMany({});
    await Order.deleteMany({});
    console.log('✅ Existing data cleared');

    // יצירת 30 עובדים
    console.log('👥 Creating 30 employees...');
    const employees = [];
    for (let i = 0; i < 30; i++) {
      const role = roles[i % roles.length];
      const language = languages[i % languages.length];
      const email = `employee${i + 1}@glass.com`;
      const password = 'password123'; // סיסמה ברירת מחדל

      const employee = await User.create({
        tenantId: TENANT_ID,
        name: employeeNames[i],
        email: email,
        password: password,
        phone: phones[i],
        role: role,
        language: language
      });
      employees.push(employee);
      console.log(`✅ Created employee: ${employee.name} (${role})`);
    }

    // יצירת 30 ספקים
    console.log('🏭 Creating 30 suppliers...');
    const suppliers = [];
    for (let i = 0; i < 30; i++) {
      const category = supplierCategories[i % supplierCategories.length];
      const leadTime = Math.floor(Math.random() * 15) + 3; // 3-17 ימים
      const supplierPhone = phones[(i + 10) % phones.length];
      const email = `contact${i + 1}@supplier.com`;

      const supplier = await Supplier.create({
        tenantId: TENANT_ID,
        name: supplierNames[i],
        contactPerson: contactPersons[i],
        phone: supplierPhone,
        email: email,
        leadTime: leadTime,
        category: category
      });
      suppliers.push(supplier);
      console.log(`✅ Created supplier: ${supplier.name} (${category})`);
    }

    // יצירת 30 הזמנות (לקוחות נוצרים מהזמנות)
    console.log('📦 Creating 30 orders (customers)...');
    const orderStatuses = ['new', 'materials_pending', 'production_pending', 'in_production', 'ready_for_install', 'scheduled', 'installed', 'completed'];

    for (let i = 0; i < 30; i++) {
      const status = orderStatuses[i % orderStatuses.length];
      const region = regions[i % regions.length];
      const supplier = suppliers[i % suppliers.length];

      const order = await Order.create({
        tenantId: TENANT_ID,
        manualOrderNumber: `ORD-${1000 + i}`,
        orderNumber: `ORD-${1000 + i}`,
        clientName: customerNames[i],
        clientPhone: phones[i],
        clientAddress: addresses[i],
        region: region,
        status: status,
        products: [
          {
            type: 'Window',
            location: 'סלון',
            description: 'חלון אלומיניום 120x100',
            quantity: 2
          }
        ],
        materials: [
          {
            materialType: 'Aluminum',
            description: 'פרופיל אלומיניום 7000',
            supplier: supplier.name,
            quantity: 10,
            isOrdered: i % 2 === 0,
            orderedAt: i % 2 === 0 ? new Date() : null,
            orderedBy: i % 2 === 0 ? employees[i % employees.length].name : null
          }
        ],
        estimatedInstallationDays: Math.floor(Math.random() * 5) + 1,
        deposit: Math.floor(Math.random() * 5000) + 1000,
        depositPaid: i % 3 === 0,
        depositPaidAt: i % 3 === 0 ? new Date() : null
      });

      console.log(`✅ Created order: ${order.manualOrderNumber} for ${order.clientName}`);
    }

    console.log('🎉 Demo seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Tenant ID: ${TENANT_ID}`);
    console.log(`   - ${employees.length} employees created`);
    console.log(`   - ${suppliers.length} suppliers created`);
    console.log(`   - 30 orders (customers) created`);
    console.log(`\n💡 Default password for all employees: password123`);

    process.exit();
  } catch (err) {
    console.error('❌ Error seeding demo data:', err);
    process.exit(1);
  }
};

seedDemo();

