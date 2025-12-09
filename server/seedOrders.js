require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');

const orders = [
  {
    clientName: "Alejandro Garcia",
    clientPhone: "+34 612 345 678",
    clientAddress: "Calle Gran Vía 22, Madrid",
    workflow: "A",
    items: [
      { productType: "Window", description: "Ventana corredera aluminio blanco (120x100)", supplier: "Klil" },
      { productType: "Door", description: "Puerta de balcón con doble acristalamiento", supplier: "GlassCo" }
    ],
    status: "offer"
  },
  {
    clientName: "Maria Rodriguez",
    clientPhone: "+34 655 987 654",
    clientAddress: "Avenida Diagonal 405, Barcelona",
    workflow: "B",
    items: [
      { productType: "Showcase", description: "Escaparate de tienda, vidrio templado 10mm", supplier: "Extal" }
    ],
    status: "production"
  },
  {
    clientName: "Restaurante El Sol",
    clientPhone: "+34 911 223 344",
    clientAddress: "Plaza Mayor 5, Salamanca",
    workflow: "A",
    items: [
      { productType: "Window", description: "Ventana fija panorámica", supplier: "GlassCo" },
      { productType: "Window", description: "Ventana oscilobatiente baño", supplier: "Klil" },
      { productType: "Door", description: "Puerta de entrada seguridad", supplier: "Extal" }
    ],
    status: "offer"
  },
  {
    clientName: "Lucia Fernandez",
    clientPhone: "+34 699 112 233",
    clientAddress: "Calle Betis 12, Sevilla",
    workflow: "C",
    items: [
      { productType: "Door", description: "Puerta corredera de cristal para cocina", supplier: "GlassCo" }
    ],
    status: "install"
  },
  {
    clientName: "Carlos Ruiz",
    clientPhone: "+34 622 445 566",
    clientAddress: "Paseo de la Castellana 100, Madrid",
    workflow: "B",
    items: [
      { productType: "Showcase", description: "Vitrina expositora con perfil negro mate", supplier: "Klil" },
      { productType: "Window", description: "Ventanal salón perfil oculto", supplier: "Extal" }
    ],
    status: "offer"
  },
  {
    clientName: "Ana Lopez",
    clientPhone: "+34 677 889 900",
    clientAddress: "Calle Colon 34, Valencia",
    workflow: "A",
    items: [
      { productType: "Window", description: "Ventana PVC imitación madera", supplier: "Klil" },
      { productType: "Window", description: "Mosquitera enrollable", supplier: "GlassCo" }
    ],
    status: "production"
  },
  {
    clientName: "Hotel Costa Azul",
    clientPhone: "+34 952 123 456",
    clientAddress: "Avenida del Mediterráneo 15, Málaga",
    workflow: "A",
    items: [
      { productType: "Showcase", description: "Muro cortina entrada principal", supplier: "Extal" },
      { productType: "Door", description: "Puerta automática de cristal", supplier: "GlassCo" },
      { productType: "Window", description: "Ventanas acústicas recepción", supplier: "Klil" }
    ],
    status: "offer"
  },
  {
    clientName: "Javier Martinez",
    clientPhone: "+34 600 555 111",
    clientAddress: "Calle San Miguel 8, Zaragoza",
    workflow: "C",
    items: [
      { productType: "Door", description: "Puerta interior lacada blanca", supplier: "Extal" }
    ],
    status: "completed"
  },
  {
    clientName: "Carmen Gomez",
    clientPhone: "+34 633 777 222",
    clientAddress: "Ría de Bilbao 4, Bilbao",
    workflow: "B",
    items: [
      { productType: "Window", description: "Ventana tejado Velux", supplier: "GlassCo" },
      { productType: "Window", description: "Cerramiento terraza aluminio", supplier: "Klil" }
    ],
    status: "install"
  },
  {
    clientName: "Pablo Sanchez",
    clientPhone: "+34 688 333 999",
    clientAddress: "Calle Larios 1, Málaga",
    workflow: "A",
    items: [
      { productType: "Showcase", description: "Escaparate joyería vidrio blindado", supplier: "Extal" }
    ],
    status: "production"
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔌 Connected to DB');
    
    // מחיקת הזמנות קיימות (אופציונלי - תוריד אם אתה רוצה לשמור את מה שיש)
    // await Order.deleteMany({}); 
    
    let count = await Order.countDocuments();
    
    for (const orderData of orders) {
      count++;
      const order = new Order({
        ...orderData,
        orderNumber: 1000 + count
      });
      await order.save();
      console.log(`✅ Created order #${order.orderNumber} for ${order.clientName}`);
    }

    console.log('🎉 Seeding completed!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();